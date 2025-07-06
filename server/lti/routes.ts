import { Router, Request, Response } from 'express';
import { LtiKeyManager, getLtiConfig } from './config';
import { generateNonce, LtiSession } from './auth';
import { storage } from '../storage';
import jwt from 'jsonwebtoken';

const router = Router();

// OIDC Login Initiation
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { iss, login_hint, target_link_uri, lti_message_hint } = req.body;
    const config = getLtiConfig();
    
    // Validate issuer
    const platform = await storage.getLtiPlatformByIssuer(iss);
    if (!platform) {
      return res.status(400).json({ error: 'Unknown platform issuer' });
    }

    // Generate state and nonce
    const state = Math.random().toString(36).substring(2, 15);
    const nonce = generateNonce();

    // Build authorization URL
    const authUrl = new URL(platform.authenticationEndpoint);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('response_mode', 'form_post');
    authUrl.searchParams.set('client_id', config.clientId);
    authUrl.searchParams.set('redirect_uri', config.launchUrl);
    authUrl.searchParams.set('scope', 'openid');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('prompt', 'none');
    authUrl.searchParams.set('login_hint', login_hint);
    if (lti_message_hint) {
      authUrl.searchParams.set('lti_message_hint', lti_message_hint);
    }

    res.redirect(authUrl.toString());
  } catch (error) {
    console.error('LTI login error:', error);
    res.status(500).json({ error: 'Login initiation failed' });
  }
});

// LTI Launch
router.post('/launch', async (req: LtiSession, res: Response) => {
  try {
    const { id_token, state } = req.body;
    
    if (!id_token) {
      return res.status(400).json({ error: 'Missing id_token' });
    }

    // Decode and validate JWT (this will be done by auth middleware)
    // For now, redirect to the main application
    const targetUrl = process.env.NODE_ENV === 'development' 
      ? '/?lti_launch=true'
      : '/?lti_launch=true';

    // Store LTI launch data in session
    if (req.lti) {
      // Create session in database for LTI user
      const session = await storage.createSession(1); // Will be updated with proper user ID
      
      // Redirect to frontend with session information
      res.redirect(`${targetUrl}&session_id=${session.sessionId}&lti_context=${encodeURIComponent(JSON.stringify(req.lti.claims))}`);
    } else {
      res.redirect(targetUrl);
    }
  } catch (error) {
    console.error('LTI launch error:', error);
    res.status(500).json({ error: 'Launch failed' });
  }
});

// JWKS Endpoint - Public key set for Canvas to verify our tokens
router.get('/jwks', async (req: Request, res: Response) => {
  try {
    const keyManager = LtiKeyManager.getInstance();
    const keySet = await keyManager.getPublicKeySet();
    
    res.json(keySet);
  } catch (error) {
    console.error('JWKS error:', error);
    res.status(500).json({ error: 'Failed to retrieve key set' });
  }
});

// Deep Linking Content Selection
router.post('/deep-linking', async (req: LtiSession, res: Response) => {
  try {
    if (!req.lti?.claims) {
      return res.status(401).json({ error: 'No LTI context for deep linking' });
    }

    const claims = req.lti.claims;
    const deepLinkSettings = claims['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'];
    
    if (!deepLinkSettings) {
      return res.status(400).json({ error: 'No deep linking settings provided' });
    }

    // For now, return available content items
    const contentItems = [
      {
        type: 'ltiResourceLink',
        title: 'Government Branches Learning Module',
        text: 'Interactive learning experience about the three branches of U.S. government',
        url: getLtiConfig().launchUrl,
        custom: {
          module_type: 'government_branches',
          assessment_enabled: 'true'
        }
      }
    ];

    // Create deep linking response JWT
    const keyManager = LtiKeyManager.getInstance();
    const privateKey = await keyManager.getPrivateKey();
    
    const deepLinkResponse = {
      iss: getLtiConfig().clientId,
      aud: claims.iss,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      nonce: generateNonce(),
      'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': contentItems,
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id': claims['https://purl.imsglobal.org/spec/lti/claim/deployment_id']
    };

    const token = jwt.sign(deepLinkResponse, privateKey.toPEM(true), { algorithm: 'RS256' });

    // Return the content selection interface
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Select Content</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .content-item { border: 1px solid #ccc; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .submit-btn { background: #0066cc; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>Select Learning Content</h1>
        <div class="content-item">
          <h3>Government Branches Learning Module</h3>
          <p>Interactive learning experience about the three branches of U.S. government</p>
          <input type="checkbox" id="content1" value="government_branches" checked>
          <label for="content1">Add to course</label>
        </div>
        <form method="post" action="${deepLinkSettings.deep_link_return_url}">
          <input type="hidden" name="JWT" value="${token}">
          <button type="submit" class="submit-btn">Add Selected Content</button>
        </form>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Deep linking error:', error);
    res.status(500).json({ error: 'Deep linking failed' });
  }
});

// Names and Role Provisioning Service (NRPS)
router.get('/nrps/:contextId', async (req: LtiSession, res: Response) => {
  try {
    if (!req.lti?.claims) {
      return res.status(401).json({ error: 'No LTI context' });
    }

    const { contextId } = req.params;
    const platform = req.lti.platform;
    
    // Get context and users (simplified for demo)
    const context = await storage.getLtiContextByContextId(platform.id, contextId);
    if (!context) {
      return res.status(404).json({ error: 'Context not found' });
    }

    // In a real implementation, you'd fetch actual course members from Canvas
    const members = [
      {
        status: 'Active',
        name: req.lti.claims.name,
        picture: req.lti.claims.picture,
        given_name: req.lti.claims.given_name,
        family_name: req.lti.claims.family_name,
        email: req.lti.claims.email,
        user_id: req.lti.claims.sub,
        roles: req.lti.claims['https://purl.imsglobal.org/spec/lti/claim/roles']
      }
    ];

    res.json({
      id: `${getLtiConfig().launchUrl}/nrps/${contextId}`,
      context: {
        id: context.contextId,
        label: context.contextLabel,
        title: context.contextTitle
      },
      members
    });
  } catch (error) {
    console.error('NRPS error:', error);
    res.status(500).json({ error: 'NRPS failed' });
  }
});

// Assignment and Grade Services (AGS) - Line Items
router.get('/lineitems/:contextId', async (req: LtiSession, res: Response) => {
  try {
    if (!req.lti?.claims) {
      return res.status(401).json({ error: 'No LTI context' });
    }

    const { contextId } = req.params;
    const baseUrl = getLtiConfig().launchUrl;

    // Return available assignments/line items
    const lineItems = [
      {
        id: `${baseUrl}/lineitems/${contextId}/1`,
        label: 'Government Branches Assessment',
        scoreMaximum: 100,
        resourceId: 'government-assessment',
        resourceLinkId: req.lti.claims['https://purl.imsglobal.org/spec/lti/claim/resource_link'].id,
        tag: 'assessment'
      }
    ];

    res.json(lineItems);
  } catch (error) {
    console.error('Line items error:', error);
    res.status(500).json({ error: 'Failed to retrieve line items' });
  }
});

// Grade Passback
router.post('/scores/:lineitemId', async (req: LtiSession, res: Response) => {
  try {
    if (!req.lti?.claims) {
      return res.status(401).json({ error: 'No LTI context' });
    }

    const { lineitemId } = req.params;
    const { userId, scoreGiven, scoreMaximum, comment, timestamp } = req.body;

    // Validate the score data
    if (typeof scoreGiven !== 'number' || typeof scoreMaximum !== 'number') {
      return res.status(400).json({ error: 'Invalid score data' });
    }

    // Store the grade in database
    const ltiUser = await storage.getLtiUserByUserId(req.lti.platform.id, userId);
    if (!ltiUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const grade = await storage.createLtiGrade({
      sessionId: req.sessionId || '',
      ltiUserId: ltiUser.id,
      lineitemId,
      score: scoreGiven,
      maxScore: scoreMaximum,
      submissionStatus: 'submitted'
    });

    // In a real implementation, you would also send this to Canvas via their AGS API
    console.log(`Grade submitted: ${scoreGiven}/${scoreMaximum} for user ${userId} on lineitem ${lineitemId}`);

    res.json({
      resultUrl: `${getLtiConfig().launchUrl}/results/${grade.id}`,
      scoreOf: lineitemId,
      userId,
      scoreGiven,
      scoreMaximum,
      comment,
      timestamp: timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('Grade passback error:', error);
    res.status(500).json({ error: 'Grade submission failed' });
  }
});

// LTI Configuration/Registration endpoint
router.get('/config', (req: Request, res: Response) => {
  const config = getLtiConfig();
  
  res.json({
    title: 'Government Branches Learning Platform',
    description: 'Interactive AI-powered learning experience for U.S. government education',
    oidc_initiation_url: config.loginUrl,
    target_link_uri: config.launchUrl,
    scopes: [
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
      'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
      'https://purl.imsglobal.org/spec/lti-ags/scope/score',
      'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly'
    ],
    extensions: [
      {
        domain: new URL(config.launchUrl).hostname,
        tool_id: 'government-learning-platform',
        platform: 'canvas.instructure.com',
        settings: {
          text: 'Government Branches Learning',
          placements: [
            {
              text: 'Government Learning Module',
              enabled: true,
              placement: 'assignment_menu',
              message_type: 'LtiResourceLinkRequest',
              target_link_uri: config.launchUrl,
              canvas_icon_class: 'icon-quiz'
            },
            {
              text: 'Select Government Content',
              enabled: true,
              placement: 'module_menu',
              message_type: 'LtiDeepLinkingRequest',
              target_link_uri: config.deepLinkingUrl
            }
          ]
        }
      }
    ],
    public_jwk_url: config.jwksUrl,
    custom_fields: {
      canvas_user_id: '$Canvas.user.id',
      canvas_course_id: '$Canvas.course.id',
      canvas_assignment_id: '$Canvas.assignment.id'
    }
  });
});

export default router;