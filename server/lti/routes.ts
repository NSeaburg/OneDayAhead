import { Router, Request, Response } from 'express';
import { LtiKeyManager, getLtiConfig } from './config';
import { generateNonce, LtiSession } from './auth';
import { storage } from '../storage';
import { contentManager } from '../contentManager';
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

    // Check if this is a Deep Linking request
    if (req.lti?.claims) {
      const messageType = req.lti.claims['https://purl.imsglobal.org/spec/lti/claim/message_type'];
      
      // If this is a Deep Linking request, handle it here
      if (messageType === 'LtiDeepLinkingRequest') {
        console.log('Detected Deep Linking request in launch');
        
        const deepLinkSettings = req.lti.claims['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'];
        
        if (!deepLinkSettings) {
          return res.status(400).json({ error: 'No deep linking settings provided' });
        }

        // Scan available content packages
        const packages = await contentManager.scanContentPackages();
        console.log(`Found ${packages.length} content packages for deep linking selection`);
        
        // Generate HTML for content selection
        const packageList = packages.map((pkg, index) => `
          <div class="content-item">
            <input type="radio" id="content${index}" name="selectedContent" value='${JSON.stringify({
              type: 'ltiResourceLink',
              title: pkg.name,
              text: `${pkg.description} - ${pkg.assessmentBot.name}`,
              url: getLtiConfig().launchUrl,
              custom: {
                content_package_id: pkg.id,
                district: pkg.district,
                course: pkg.course,
                topic: pkg.topic,
                assessment_enabled: 'true'
              }
            }).replace(/'/g, '&apos;')}' ${index === 0 ? 'checked' : ''}>
            <label for="content${index}">
              <h3>${pkg.name}</h3>
              <p><strong>Course:</strong> ${pkg.course.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              <p><strong>Description:</strong> ${pkg.description}</p>
              <p><strong>Assessment Bot:</strong> ${pkg.assessmentBot.name} - ${pkg.assessmentBot.description}</p>
            </label>
          </div>
        `).join('');

        // Return the content selection interface
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Select Learning Content</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
              h1 { color: #333; }
              .content-item { 
                border: 1px solid #ddd; 
                padding: 20px; 
                margin: 15px 0; 
                border-radius: 8px; 
                background-color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
              }
              .content-item:hover {
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                transform: translateY(-2px);
              }
              .content-item input[type="radio"] {
                margin-right: 10px;
              }
              .content-item label {
                cursor: pointer;
                display: block;
              }
              .content-item h3 { 
                margin: 0 0 10px 0; 
                color: #0066cc;
              }
              .content-item p { 
                margin: 5px 0; 
                color: #666;
              }
              .submit-btn { 
                background: #0066cc; 
                color: white; 
                padding: 12px 30px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                font-size: 16px;
                margin-top: 20px;
                transition: background-color 0.3s ease;
              }
              .submit-btn:hover {
                background: #0052a3;
              }
              .error { 
                color: #d32f2f; 
                margin: 10px 0;
                padding: 10px;
                background-color: #ffebee;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <h1>Select Learning Content</h1>
            ${packages.length === 0 ? '<p class="error">No content packages available. Please create content packages first.</p>' : ''}
            <form id="deepLinkForm" method="post" action="${deepLinkSettings.deep_link_return_url}">
              ${packageList}
              <input type="hidden" name="JWT" id="jwtToken" value="">
              ${packages.length > 0 ? '<button type="submit" class="submit-btn">Add Selected Content to Course</button>' : ''}
            </form>
            
            <script>
              document.getElementById('deepLinkForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const selectedRadio = document.querySelector('input[name="selectedContent"]:checked');
                if (!selectedRadio) {
                  alert('Please select a content package');
                  return;
                }
                
                const selectedContent = JSON.parse(selectedRadio.value);
                
                // Create the JWT with selected content
                const response = await fetch('/api/lti/deep-linking/jwt', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    contentItem: selectedContent,
                    deepLinkSettings: ${JSON.stringify(deepLinkSettings)},
                    claims: ${JSON.stringify(req.lti.claims)}
                  })
                });
                
                const { token } = await response.json();
                document.getElementById('jwtToken').value = token;
                
                // Submit the form
                this.submit();
              });
            </script>
          </body>
          </html>
        `);
      }
    }

    // Regular resource launch handling
    let contentPackageId = '';
    
    if (req.lti?.claims) {
      const customClaim = req.lti.claims['https://purl.imsglobal.org/spec/lti/claim/custom'];
      if (customClaim) {
        // Extract content package information from custom parameters
        contentPackageId = customClaim.content_package_id || 
                          customClaim.custom_content_package_id || 
                          'demo-district/civics-government/three-branches'; // Default fallback
      }
    }

    // Build target URL with content package information
    const targetUrl = process.env.NODE_ENV === 'development' 
      ? '/?lti_launch=true'
      : '/?lti_launch=true';

    // Store LTI launch data in session
    if (req.lti) {
      // Create session in database for LTI user
      const session = await storage.createSession(1); // Will be updated with proper user ID
      
      // Add content package ID to the redirect URL
      const redirectUrl = contentPackageId 
        ? `${targetUrl}&session_id=${session.sessionId}&experience=${encodeURIComponent(contentPackageId)}&lti_context=${encodeURIComponent(JSON.stringify(req.lti.claims))}`
        : `${targetUrl}&session_id=${session.sessionId}&lti_context=${encodeURIComponent(JSON.stringify(req.lti.claims))}`;
      
      res.redirect(redirectUrl);
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

    // Scan available content packages
    const packages = await contentManager.scanContentPackages();
    
    // Convert packages to LTI content items
    const contentItems = packages.map(pkg => ({
      type: 'ltiResourceLink',
      title: pkg.name,
      text: `${pkg.description} - ${pkg.assessmentBot.name}`,
      url: getLtiConfig().launchUrl,
      custom: {
        content_package_id: pkg.id,
        district: pkg.district,
        course: pkg.course,
        topic: pkg.topic,
        assessment_enabled: 'true'
      }
    }));

    // Generate HTML for content selection
    const packageList = packages.map((pkg, index) => `
      <div class="content-item">
        <input type="radio" id="content${index}" name="selectedContent" value='${JSON.stringify({
          type: 'ltiResourceLink',
          title: pkg.name,
          text: `${pkg.description} - ${pkg.assessmentBot.name}`,
          url: getLtiConfig().launchUrl,
          custom: {
            content_package_id: pkg.id,
            district: pkg.district,
            course: pkg.course,
            topic: pkg.topic,
            assessment_enabled: 'true'
          }
        }).replace(/'/g, '&apos;')}' ${index === 0 ? 'checked' : ''}>
        <label for="content${index}">
          <h3>${pkg.name}</h3>
          <p><strong>Course:</strong> ${pkg.course.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
          <p><strong>Description:</strong> ${pkg.description}</p>
          <p><strong>Assessment Bot:</strong> ${pkg.assessmentBot.name} - ${pkg.assessmentBot.description}</p>
        </label>
      </div>
    `).join('');

    // Return the content selection interface
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Select Learning Content</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
          h1 { color: #333; }
          .content-item { 
            border: 1px solid #ddd; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px; 
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
          }
          .content-item:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            transform: translateY(-2px);
          }
          .content-item input[type="radio"] {
            margin-right: 10px;
          }
          .content-item label {
            cursor: pointer;
            display: block;
          }
          .content-item h3 { 
            margin: 0 0 10px 0; 
            color: #0066cc;
          }
          .content-item p { 
            margin: 5px 0; 
            color: #666;
          }
          .submit-btn { 
            background: #0066cc; 
            color: white; 
            padding: 12px 30px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            transition: background-color 0.3s ease;
          }
          .submit-btn:hover {
            background: #0052a3;
          }
          .error { 
            color: #d32f2f; 
            margin: 10px 0;
            padding: 10px;
            background-color: #ffebee;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <h1>Select Learning Content</h1>
        ${packages.length === 0 ? '<p class="error">No content packages available. Please create content packages first.</p>' : ''}
        <form id="deepLinkForm" method="post" action="${deepLinkSettings.deep_link_return_url}">
          ${packageList}
          <input type="hidden" name="JWT" id="jwtToken" value="">
          ${packages.length > 0 ? '<button type="submit" class="submit-btn">Add Selected Content to Course</button>' : ''}
        </form>
        
        <script>
          document.getElementById('deepLinkForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const selectedRadio = document.querySelector('input[name="selectedContent"]:checked');
            if (!selectedRadio) {
              alert('Please select a content package');
              return;
            }
            
            const selectedContent = JSON.parse(selectedRadio.value);
            
            // Create the JWT with selected content
            const response = await fetch('/api/lti/deep-linking/jwt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contentItem: selectedContent,
                deepLinkSettings: ${JSON.stringify(deepLinkSettings)},
                claims: ${JSON.stringify(claims)}
              })
            });
            
            const { token } = await response.json();
            document.getElementById('jwtToken').value = token;
            
            // Submit the form
            this.submit();
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Deep linking error:', error);
    res.status(500).json({ error: 'Deep linking failed' });
  }
});

// Deep Linking JWT Generation Endpoint
router.post('/deep-linking/jwt', async (req: LtiSession, res: Response) => {
  try {
    const { contentItem, deepLinkSettings, claims } = req.body;
    
    if (!contentItem || !deepLinkSettings || !claims) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create deep linking response JWT
    const keyManager = LtiKeyManager.getInstance();
    const privateKey = await keyManager.getPrivateKey();
    
    const deepLinkResponse = {
      iss: getLtiConfig().clientId,
      aud: claims.iss,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      nonce: generateNonce(),
      'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': [contentItem],
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id': claims['https://purl.imsglobal.org/spec/lti/claim/deployment_id'],
      'https://purl.imsglobal.org/spec/lti-dl/claim/message': 'Content successfully added to course'
    };

    const token = jwt.sign(deepLinkResponse, privateKey.toPEM(true), { algorithm: 'RS256' });
    
    res.json({ token });
  } catch (error) {
    console.error('Deep linking JWT generation error:', error);
    res.status(500).json({ error: 'Failed to generate JWT' });
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

// Development route to test deep linking interface without LTI authentication
router.get('/deep-linking-dev', async (req: Request, res: Response) => {
  try {
    console.log('🧪 Development deep linking interface requested');
    
    // Scan available content packages
    const packages = await contentManager.scanContentPackages();
    console.log(`🧪 Found ${packages.length} content packages for selection`);
    
    // Generate HTML for content selection (same as production but without JWT submission)
    const packageList = packages.map((pkg, index) => `
      <div class="content-item">
        <input type="radio" id="content${index}" name="selectedContent" value='${JSON.stringify({
          type: 'ltiResourceLink',
          title: pkg.name,
          text: `${pkg.description} - ${pkg.assessmentBot.name}`,
          url: getLtiConfig().launchUrl,
          custom: {
            content_package_id: pkg.id,
            district: pkg.district,
            course: pkg.course,
            topic: pkg.topic,
            assessment_enabled: 'true'
          }
        }).replace(/'/g, '&apos;')}' ${index === 0 ? 'checked' : ''}>
        <label for="content${index}">
          <h3>${pkg.name}</h3>
          <p><strong>Course:</strong> ${pkg.course.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
          <p><strong>Description:</strong> ${pkg.description}</p>
          <p><strong>Assessment Bot:</strong> ${pkg.assessmentBot.name} - ${pkg.assessmentBot.description}</p>
        </label>
      </div>
    `).join('');

    // Return the content selection interface
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Select Learning Content (Development Mode)</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
          h1 { color: #333; }
          .dev-banner {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            color: #856404;
          }
          .content-item { 
            border: 1px solid #ddd; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px; 
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
          }
          .content-item:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            transform: translateY(-2px);
          }
          .content-item input[type="radio"] {
            margin-right: 10px;
          }
          .content-item label {
            cursor: pointer;
            display: block;
          }
          .content-item h3 { 
            margin: 0 0 10px 0; 
            color: #0066cc;
          }
          .content-item p { 
            margin: 5px 0; 
            color: #666;
          }
          .submit-btn { 
            background: #0066cc; 
            color: white; 
            padding: 12px 30px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            transition: background-color 0.3s ease;
          }
          .submit-btn:hover {
            background: #0052a3;
          }
          .error { 
            color: #d32f2f; 
            margin: 10px 0;
            padding: 10px;
            background-color: #ffebee;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="dev-banner">
          <strong>Development Mode:</strong> This is a test interface to verify deep linking content selection works properly. In production, this interface would be accessed through Canvas LTI authentication.
        </div>
        
        <h1>Select Learning Content</h1>
        ${packages.length === 0 ? '<p class="error">No content packages available. Please create content packages first.</p>' : ''}
        <form id="deepLinkForm">
          ${packageList}
          ${packages.length > 0 ? '<button type="submit" class="submit-btn">Add Selected Content to Course</button>' : ''}
        </form>
        
        <script>
          document.getElementById('deepLinkForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const selectedRadio = document.querySelector('input[name="selectedContent"]:checked');
            if (!selectedRadio) {
              alert('Please select a content package');
              return;
            }
            
            const selectedContent = JSON.parse(selectedRadio.value);
            
            // Show success message for development
            alert('Success! In Canvas, this would:\\n\\n1. Generate a signed JWT with the selected content\\n2. Submit back to Canvas\\n3. Canvas would add the content to the assignment\\n\\nSelected: ' + selectedContent.title);
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Development deep linking error:', error);
    res.status(500).json({ error: 'Development deep linking failed' });
  }
});

// LTI Configuration/Registration endpoint
router.get('/config', (req: Request, res: Response) => {
  const config = getLtiConfig();
  
  res.json({
    title: 'One Day Ahead Learning Platform',
    description: 'AI-powered adaptive learning platform',
    oidc_initiation_url: config.loginUrl,
    target_link_uri: config.launchUrl,
    scopes: [
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
      'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
      'https://purl.imsglobal.org/spec/lti-ags/scope/score',
      'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly'
    ],
    public_jwk_url: config.jwksUrl,
    extensions: [
      {
        platform: 'canvas.instructure.com',
        settings: {
          placements: [
            {
              placement: 'assignment_selection',
              message_type: 'LtiDeepLinkingRequest',
              target_link_uri: config.launchUrl
            },
            {
              placement: 'link_selection', 
              message_type: 'LtiDeepLinkingRequest',
              target_link_uri: config.launchUrl
            },
            {
              placement: 'editor_button',
              message_type: 'LtiDeepLinkingRequest',
              target_link_uri: config.launchUrl
            }
          ]
        }
      }
    ]
  });
});

export default router;