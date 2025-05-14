import { Request, Response, NextFunction } from 'express';

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';

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
  ...(isProduction ? [] : ['http://localhost:*', 'https://*.replit.app']),
];

/**
 * Set up CORS headers appropriate for LMS iframe embedding
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Get the origin from the request headers
  const origin = req.headers.origin;
  
  // Check if the origin is allowed (wildcard handling)
  if (origin) {
    const isAllowed = allowedLmsDomains.some(allowedDomain => {
      if (allowedDomain.includes('*')) {
        const pattern = allowedDomain.replace('*.', '(.+\\.)').replace('*', '(.*)');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return origin === allowedDomain;
    });
    
    if (isAllowed) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
  }
  
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
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Consider restricting this further in production
    "connect-src 'self' https://api.anthropic.com",
    `frame-ancestors ${allowedLmsDomains.join(' ')}`,
    "img-src 'self' data: blob:",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "media-src 'self' https://* http://*", // Allow media from all sources for videos and audio
    "frame-src 'self' https://* http://*", // Allow iframes from all sources for embedded content
  ];
  
  // Set Content-Security-Policy header
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Allow embedding in iframes from specified domains
  const frameAncestors = allowedLmsDomains.join(' ');
  res.setHeader('X-Frame-Options', `ALLOW-FROM ${frameAncestors}`);
  
  // Prevent content type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature policy
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