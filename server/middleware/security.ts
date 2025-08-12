import { Request, Response, NextFunction } from 'express';

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDeployedProduction = isProduction && (
  process.env.REPLIT_DOMAINS?.includes('onedayahead.com') || 
  process.env.REPL_SLUG?.includes('prod') ||
  process.env.HOST?.includes('onedayahead.com')
);

// Array of allowed LMS domains for embedding
const allowedLmsDomains = [
  // Canvas domains
  'https://canvas.instructure.com',
  'https://*.instructure.com',
  
  // Blackboard domains
  'https://*.blackboard.com',
  'https://blackboard.com',
  
  // Add other LMS domains as needed
  'https://*.moodlecloud.com',
  'https://*.brightspace.com',
  
  // Development/testing domains
  'http://localhost:*', 
  'https://*.replit.app',
  
  // Specific domains we're embedding on
  'https://ai.onedayahead.com',
  'https://demo.onedayahead.com',
  'https://*.onedayahead.com',
  
  // Allow embedding from any origin in development
  ...(isProduction ? [] : ['*']),
];

/**
 * Set up CORS headers appropriate for LMS iframe embedding
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Always allow any origin for development purposes
  const origin = req.headers.origin || '*';
  
  // Set permissive CORS headers for all requests
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
}

/**
 * Set security headers for LMS iframe embedding
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if this is an iframe-specific route
  const isIframeRoute = req.path === '/iframe-app' || req.path === '/embed' || req.path === '/embed-direct';
  
  if (isIframeRoute) {
    // For iframe routes, set very permissive headers
    res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *");
    
    // Explicitly remove X-Frame-Options to allow iframe embedding
    res.removeHeader('X-Frame-Options');
  } else {
    // For regular routes, use environment-specific security headers
    const cspDirectives = [
      "default-src 'self'",
      // Environment-specific script sources - no Replit in deployed production
      isDeployedProduction 
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : isProduction
          ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com"
          : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com",
      "connect-src 'self' https://* http://*",
      // Frame ancestors - allow specific domains for production, more permissive for dev
      isProduction
        ? "frame-ancestors 'self' https://*.instructure.com https://*.blackboard.com https://*.onedayahead.com"
        : "frame-ancestors 'self' https://*.onedayahead.com https://*.replit.app https://*.replit.dev",
      "img-src 'self' data: blob: https://* http://*",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "media-src 'self' https://* http://*",
      "frame-src 'self' https://* http://*",
    ];
    
    // Set Content-Security-Policy header
    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
    
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Explicitly set X-Frame-Options to ALLOWALL for all routes
    res.setHeader('X-Frame-Options', 'ALLOWALL');
  }
  
  // Referrer policy - less restrictive for iframe embedding
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  
  // Permissions policy - still restrictive for security
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Pass to next middleware
  next();
}

/**
 * Configure secure cookie settings for LMS environments
 * This middleware sets the options for the cookie-parser and express-session middleware
 */
export function getSecureCookieConfig() {
  return {
    secure: isProduction, // HTTPS only in production
    httpOnly: true, // Not accessible via JavaScript
    sameSite: isProduction ? 'none' as const : 'lax' as const, // TypeScript needs const assertion for literal types
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };
}

/**
 * Data cleanup middleware - can be scheduled or used on specific routes
 * Implements data retention policies for FERPA compliance
 */
export async function dataRetentionMiddleware(req: Request, res: Response, next: NextFunction) {
  // This would require implementation of your storage interface
  // Example: Delete sessions older than 1 year
  // await storage.cleanupOldSessions(365);
  
  // For now, just continue to next middleware
  next();
}