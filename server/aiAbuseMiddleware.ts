import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import rateLimit from "express-rate-limit";

// Rate limiting configurations
export const aiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 AI requests per minute
  message: "Too many AI requests. Please wait before sending another message.",
  keyGenerator: (req) => req.sessionId || req.session?.sessionID || req.sessionID || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiRateLimit10Min = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 AI requests per 10 minutes
  message: "You've reached the 10-minute limit for AI requests. Please wait before continuing.",
  keyGenerator: (req) => req.sessionId || req.session?.sessionID || req.sessionID || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

export const ipRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500, // 500 requests per hour per IP
  message: "Too many requests from this IP address. Access temporarily blocked.",
  keyGenerator: (req) => req.ip,
  handler: async (req, res) => {
    // Block IP for 24 hours when limit reached
    const ipAddress = req.ip;
    const blockedUntil = new Date();
    blockedUntil.setHours(blockedUntil.getHours() + 24);
    
    try {
      await storage.blockIp({
        ipAddress,
        reason: "Exceeded 500 requests per hour",
        blockedUntil,
      });
      console.warn(`🚨 IP ${ipAddress} blocked for 24 hours due to excessive requests`);
    } catch (error) {
      console.error("Failed to block IP:", error);
    }
    
    res.status(429).json({
      error: "Too many requests from this IP address. Access temporarily blocked."
    });
  },
});

// Global request counter for circuit breaker
let globalRequestCount = 0;
let requestCountResetTime = Date.now();
let platformPaused = false;

// Circuit breaker middleware
export const circuitBreakerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  
  // Reset counter every hour
  if (now - requestCountResetTime > 60 * 60 * 1000) {
    globalRequestCount = 0;
    requestCountResetTime = now;
    platformPaused = false;
  }
  
  // Check if platform is paused
  if (platformPaused) {
    return res.status(503).json({
      error: "Platform temporarily paused due to high usage. Please try again later.",
    });
  }
  
  // Increment counter
  globalRequestCount++;
  
  // Pause platform if over 10,000 requests per hour
  if (globalRequestCount > 10000) {
    platformPaused = true;
    console.error(`🚨 PLATFORM PAUSED: Over 10,000 requests in the last hour`);
    return res.status(503).json({
      error: "Platform temporarily paused due to high usage. Please try again later.",
    });
  }
  
  next();
};

// LTI session validation middleware
export const requireLtiSession = (req: Request, res: Response, next: NextFunction) => {
  // Debug session persistence
  console.log('Session check:', {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    ltiContext: req.session?.ltiContext,
    sessionData: req.session
  });

  // Skip in development mode
  if (process.env.NODE_ENV === "development") {
    return next();
  }
  
  // Check for valid session using multiple criteria
  const hasValidSession = !!(
    req.session && 
    (req.session.ltiContext || 
     req.session.lti || 
     req.session.userId ||
     req.sessionID)
  );
  
  if (!hasValidSession) {
    return res.status(401).json({
      error: "Valid LTI session required for AI features",
    });
  }
  
  next();
};

// IP blocking check middleware
export const checkBlockedIp = async (req: Request, res: Response, next: NextFunction) => {
  const ipAddress = req.ip;
  
  try {
    const isBlocked = await storage.isIpBlocked(ipAddress);
    if (isBlocked) {
      return res.status(403).json({
        error: "Access denied. This IP address has been temporarily blocked.",
      });
    }
  } catch (error) {
    console.error("Error checking blocked IP:", error);
  }
  
  next();
};

// Message validation middleware - handles both single message and messages array formats
export const validateMessage = (req: Request, res: Response, next: NextFunction) => {
  const { message, messages } = req.body;
  
  // Handle different endpoint formats
  let messagesToValidate: string[] = [];
  
  // For endpoints that send a single message
  if (message) {
    if (typeof message !== "string") {
      return res.status(400).json({
        error: "Message must be a string",
      });
    }
    messagesToValidate = [message];
  }
  
  // For endpoints that send an array of messages (like claude-chat)
  if (messages) {
    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "Messages must be an array",
      });
    }
    
    // Extract content from message objects
    messagesToValidate = messages
      .filter((msg: any) => msg && msg.content && typeof msg.content === "string")
      .map((msg: any) => msg.content);
  }
  
  // If neither format is provided, reject
  if (messagesToValidate.length === 0) {
    return res.status(400).json({
      error: "Message or messages array is required",
    });
  }
  
  // Validate each message
  for (const msg of messagesToValidate) {
    // Check message length
    if (msg.length > 2000) {
      return res.status(400).json({
        error: "Message too long. Maximum 2,000 characters allowed.",
      });
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /(.)\1{50,}/, // Same character repeated 50+ times
      /^(.{1,100})\1{3,}$/, // Same phrase repeated 4+ times
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(msg)) {
        console.warn(`🚨 Suspicious message pattern detected from IP ${req.ip}: ${msg.substring(0, 100)}...`);
        return res.status(400).json({
          error: "Message contains suspicious patterns",
        });
      }
    }
  }
  
  next();
};

// Daily usage check middleware
export const checkDailyUsage = async (req: Request, res: Response, next: NextFunction) => {
  // Try multiple ways to get session ID based on the middleware being used
  const sessionId = req.sessionId || req.session?.sessionID || req.sessionID;
  if (!sessionId) {
    console.log('❌ Daily usage check failed - no session ID found:', {
      sessionId: req.sessionId,
      sessionSessionID: req.session?.sessionID,
      reqSessionID: req.sessionID,
      hasSession: !!req.session
    });
    return res.status(401).json({
      error: "Session required",
    });
  }
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check daily message limit
    const dailyMessageCount = await storage.getDailyMessageCount(sessionId, today);
    if (dailyMessageCount >= 100) {
      return res.status(429).json({
        error: "Daily limit reached. You can send up to 100 AI messages per day.",
      });
    }
    
    // Check daily experience limit
    const dailyExperienceCount = await storage.getDailyExperienceCount(sessionId, today);
    if (dailyExperienceCount >= 5) {
      return res.status(429).json({
        error: "Daily limit reached. You can complete up to 5 experiences per day.",
      });
    }
  } catch (error) {
    console.error("Error checking daily usage:", error);
  }
  
  next();
};

// Conversation length limiter
export const limitConversationLength = (messages: any[]) => {
  // Only include last 15 messages in AI context
  if (messages.length > 15) {
    return messages.slice(-15);
  }
  return messages;
};

// Token estimation utility
export const estimateTokens = (inputText: string, outputText: string): number => {
  return Math.ceil((inputText.length + outputText.length) / 4);
};

// Usage tracking utility
export const trackAiUsage = async (
  sessionId: string,
  endpoint: string,
  inputText: string,
  outputText: string,
  ipAddress: string
) => {
  const inputChars = inputText.length;
  const outputChars = outputText.length;
  const estimatedTokens = estimateTokens(inputText, outputText);
  
  try {
    await storage.recordAiUsage({
      sessionId,
      endpoint,
      estimatedTokens,
      inputChars,
      outputChars,
      ipAddress,
    });
    
    // Check daily cost threshold
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyTokens = await storage.getDailyTokenUsage(today);
    const estimatedCost = (dailyTokens * 0.001); // Rough estimate: $0.001 per token
    
    if (estimatedCost > 50) {
      console.warn(`⚠️ Daily AI usage cost estimated at $${estimatedCost.toFixed(2)} - approaching $50 threshold`);
    }
    
    if (estimatedCost > 100) {
      console.error(`🚨 Daily AI usage cost estimated at $${estimatedCost.toFixed(2)} - AUTO-DISABLE threshold reached!`);
      // TODO: Implement auto-disable mechanism
    }
  } catch (error) {
    console.error("Failed to track AI usage:", error);
  }
};