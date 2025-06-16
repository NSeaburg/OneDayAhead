import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { LtiKeyManager, getLtiConfig } from './config';
import { storage } from '../storage';

export interface LtiClaims {
  iss: string; // issuer
  sub: string; // subject (user ID)
  aud: string; // audience (client ID)
  exp: number; // expiration
  iat: number; // issued at
  nonce: string; // nonce
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id': string;
  'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': string;
  'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
    id: string;
    title?: string;
    description?: string;
  };
  'https://purl.imsglobal.org/spec/lti/claim/context': {
    id: string;
    type: string[];
    label?: string;
    title?: string;
  };
  'https://purl.imsglobal.org/spec/lti/claim/roles': string[];
  'https://purl.imsglobal.org/spec/lti/claim/platform_instance': {
    guid: string;
    name?: string;
    url?: string;
  };
  'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': {
    document_target: string;
    height?: number;
    width?: number;
    return_url?: string;
  };
  'https://purl.imsglobal.org/spec/lti/claim/custom'?: Record<string, any>;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
  'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'?: {
    scope: string[];
    lineitems: string;
    lineitem?: string;
  };
  'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'?: {
    context_memberships_url: string;
    service_versions: string[];
  };
  'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'?: {
    deep_link_return_url: string;
    accept_types: string[];
    accept_presentation_document_targets: string[];
    accept_media_types?: string[];
    auto_create?: boolean;
  };
}

export interface LtiSession extends Request {
  lti?: {
    claims: LtiClaims;
    platform: any;
    context: any;
    user: any;
    tenant: any;
  };
}

// Store nonces temporarily to prevent replay attacks
const nonceStore = new Map<string, number>();

// Clean up old nonces every 5 minutes
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(nonceStore.entries());
  for (const [nonce, timestamp] of entries) {
    if (now - timestamp > 300000) { // 5 minutes
      nonceStore.delete(nonce);
    }
  }
}, 300000);

export function generateNonce(): string {
  const nonce = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
  nonceStore.set(nonce, Date.now());
  return nonce;
}

export function validateNonce(nonce: string): boolean {
  const exists = nonceStore.has(nonce);
  if (exists) {
    nonceStore.delete(nonce); // Single use
  }
  return exists;
}

export async function validateLtiToken(token: string): Promise<LtiClaims | null> {
  try {
    const keyManager = LtiKeyManager.getInstance();
    const publicKey = await keyManager.getPrivateKey(); // We use our private key to verify tokens we signed
    
    const decoded = jwt.verify(token, publicKey.toPEM(true), {
      algorithms: ['RS256'],
      audience: getLtiConfig().clientId,
    }) as LtiClaims;

    // Validate nonce
    if (!validateNonce(decoded.nonce)) {
      console.error('Invalid or reused nonce');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('JWT validation failed:', error);
    return null;
  }
}

export async function ltiAuthMiddleware(req: LtiSession, res: Response, next: NextFunction) {
  // Skip LTI auth in development mode for direct testing
  if (process.env.NODE_ENV === 'development' && req.path.startsWith('/dev')) {
    // Create mock LTI context for development
    req.lti = {
      claims: {
        iss: 'https://canvas.instructure.com',
        sub: 'dev-user-123',
        aud: 'dev-client',
        exp: Date.now() / 1000 + 3600,
        iat: Date.now() / 1000,
        nonce: 'dev-nonce',
        'https://purl.imsglobal.org/spec/lti/claim/deployment_id': 'dev-deployment',
        'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': req.originalUrl,
        'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
          id: 'dev-resource-123'
        },
        'https://purl.imsglobal.org/spec/lti/claim/context': {
          id: 'dev-context-123',
          type: ['CourseTemplate'],
          label: 'DEV 101',
          title: 'Development Course'
        },
        'https://purl.imsglobal.org/spec/lti/claim/roles': ['http://purl.imsglobal.org/vocab/lis/v2/membership#Learner'],
        'https://purl.imsglobal.org/spec/lti/claim/platform_instance': {
          guid: 'dev-platform-123',
          name: 'Development Canvas',
          url: 'https://dev.instructure.com'
        },
        'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': {
          document_target: 'iframe'
        },
        name: 'Dev User',
        given_name: 'Dev',
        family_name: 'User',
        email: 'dev@example.com'
      },
      platform: { id: 1, name: 'Development Platform' },
      context: { id: 1, contextId: 'dev-context-123' },
      user: { id: 1, name: 'Dev User' },
      tenant: { id: 1, name: 'Development Tenant' }
    };
    return next();
  }

  // Extract JWT token from request
  const authHeader = req.headers.authorization;
  const tokenFromBody = req.body?.id_token;
  const tokenFromQuery = req.query?.id_token as string;
  
  const token = authHeader?.replace('Bearer ', '') || tokenFromBody || tokenFromQuery;

  if (!token) {
    return res.status(401).json({ error: 'No LTI token provided' });
  }

  try {
    const claims = await validateLtiToken(token);
    if (!claims) {
      return res.status(401).json({ error: 'Invalid LTI token' });
    }

    // Load or create platform, context, user records
    const ltiContext = await createOrUpdateLtiContext(claims);
    req.lti = ltiContext;

    next();
  } catch (error) {
    console.error('LTI authentication error:', error);
    res.status(401).json({ error: 'LTI authentication failed' });
  }
}

async function createOrUpdateLtiContext(claims: LtiClaims) {
  // Find or create platform
  let platform = await storage.getLtiPlatformByIssuer(claims.iss);
  if (!platform) {
    platform = await storage.createLtiPlatform({
      issuer: claims.iss,
      name: claims['https://purl.imsglobal.org/spec/lti/claim/platform_instance']?.name || 'Unknown Platform',
      clientId: claims.aud,
      authenticationEndpoint: `${claims.iss}/api/lti/authorize_redirect`,
      accesstokenEndpoint: `${claims.iss}/login/oauth2/token`,
      authConfig: {}
    });
  }

  // Find or create context
  const contextClaim = claims['https://purl.imsglobal.org/spec/lti/claim/context'];
  let context = await storage.getLtiContextByContextId(platform.id, contextClaim.id);
  if (!context) {
    context = await storage.createLtiContext({
      platformId: platform.id,
      contextId: contextClaim.id,
      contextType: contextClaim.type?.[0],
      contextTitle: contextClaim.title,
      contextLabel: contextClaim.label
    });
  }

  // Find or create user
  let user = await storage.getLtiUserByUserId(platform.id, claims.sub);
  if (!user) {
    user = await storage.createLtiUser({
      platformId: platform.id,
      ltiUserId: claims.sub,
      name: claims.name,
      givenName: claims.given_name,
      familyName: claims.family_name,
      email: claims.email,
      roles: claims['https://purl.imsglobal.org/spec/lti/claim/roles']
    });
  }

  // Find or create tenant (could be based on platform or context)
  let tenant = await storage.getTenantByPlatform(platform.id);
  if (!tenant) {
    tenant = await storage.createTenant({
      name: platform.name,
      domain: new URL(claims.iss).hostname,
      platformId: platform.id,
      config: {},
      isActive: true
    });
  }

  return {
    claims,
    platform,
    context,
    user,
    tenant
  };
}

export function requireLtiRole(roles: string[]) {
  return (req: LtiSession, res: Response, next: NextFunction) => {
    if (!req.lti?.claims) {
      return res.status(401).json({ error: 'No LTI context' });
    }

    const userRoles = req.lti.claims['https://purl.imsglobal.org/spec/lti/claim/roles'] || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient LTI role permissions' });
    }

    next();
  };
}

// Common LTI roles for convenience
export const LTI_ROLES = {
  INSTRUCTOR: 'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
  LEARNER: 'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
  TEACHING_ASSISTANT: 'http://purl.imsglobal.org/vocab/lis/v2/membership#TeachingAssistant',
  ADMIN: 'http://purl.imsglobal.org/vocab/lis/v2/membership#Administrator'
};