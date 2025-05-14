import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../storage";
import { getSecureCookieConfig } from "./security";

// Interface to extend Express Request with session
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      userId?: number | null;
    }
  }
}

/**
 * Middleware to handle sessions
 * For simplicity, we'll use a cookie-based session system
 * In a production environment, you'd want to add more security features
 */
export async function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if there's a session ID in the cookies
  let sessionId = req.cookies?.sessionId;
  
  // If no session exists, create a new one
  if (!sessionId) {
    sessionId = uuidv4();
    
    // Create anonymous user for the session if needed
    // In a real system, you might want to authenticate users properly
    const anonymousUser = await storage.createUser({
      username: `anonymous-${sessionId.substring(0, 8)}`,
      password: uuidv4() // Generate random password for anonymous user
    });
    
    // Create session for the user
    const session = await storage.createSession(anonymousUser.id);
    sessionId = session.sessionId;
    
    // Set session cookie with secure settings
    res.cookie('sessionId', sessionId, getSecureCookieConfig());
    
    // Store user ID in the request
    req.userId = anonymousUser.id;
  } else {
    // Validate existing session
    const isValid = await storage.validateSession(sessionId);
    
    if (!isValid) {
      // Session expired or invalid, create a new one
      sessionId = uuidv4();
      
      // Create anonymous user for the session
      const anonymousUser = await storage.createUser({
        username: `anonymous-${sessionId.substring(0, 8)}`,
        password: uuidv4()
      });
      
      // Create session for the user
      const session = await storage.createSession(anonymousUser.id);
      sessionId = session.sessionId;
      
      // Set new session cookie
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Store user ID in the request
      req.userId = anonymousUser.id;
    } else {
      // Get the session to extract the user ID
      const session = await storage.getSessionById(sessionId);
      if (session) {
        req.userId = session.userId;
      }
    }
  }
  
  // Set session ID in request for use in routes
  req.sessionId = sessionId;
  
  next();
}