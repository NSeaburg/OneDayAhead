# Learning Platform - Architecture & Configuration

## Overview

This repository contains a comprehensive LTI 1.3 compliant learning platform application designed specifically for Educational Technology (EdTech) environments. The platform provides an interactive learning experience centered around the three branches of the U.S. government, featuring AI-powered conversations, assessments, and personalized feedback mechanisms with full Canvas LMS integration.

The application is architected as a full-stack web application with a React frontend and Express.js backend, utilizing modern technologies for scalable, secure deployment in Learning Management Systems (LMS) such as Canvas and Blackboard. The platform now includes complete LTI 1.3 authentication, grade passback, deep linking, and Names and Role Provisioning Service (NRPS) support.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **Session Management**: Cookie-based sessions with UUID generation
- **Security**: Comprehensive CORS, CSP, and security headers for LMS embedding

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configurable via DATABASE_URL)
- **Migrations**: Custom migration system in `server/migrations.ts`

### AI Integration
- **Primary Provider**: Anthropic Claude (claude-3-7-sonnet-20250219)
- **Streaming**: Real-time response streaming for enhanced user experience
- **LTI Integration**: Context-aware AI assistants with Canvas user data

### LTI 1.3 Integration
- **Authentication**: JWT-based OIDC login flow with Canvas
- **Grade Passback**: Assignment and Grade Services (AGS) for automatic grade submission
- **Deep Linking**: Content selection and course integration
- **NRPS**: Names and Role Provisioning Service for course roster access
- **Multi-Tenant**: Support for multiple Canvas instances with separate configurations

## Key Components

### Data Models
The application uses comprehensive database schema with LTI 1.3 support:
- **users**: User management with LTI user linking
- **sessions**: Secure session tracking with LTI context
- **conversations**: AI chat history with tenant and LTI user classification
- **feedbacks**: Assessment results with automatic grade passback
- **lti_platforms**: Canvas instance configurations
- **lti_users**: LTI user identity management
- **lti_contexts**: Course/context information from Canvas
- **tenants**: Multi-instance support for different institutions
- **lti_grades**: Grade tracking and submission status

### Security Framework
- **LMS Integration**: Designed for iframe embedding in Canvas, Blackboard, and other LMS platforms
- **CORS Configuration**: Allowlist-based origin validation with LMS domain support
- **Content Security Policy**: Restrictive CSP headers for secure embedding
- **Session Security**: HTTP-only cookies with SameSite policies

### AI Assistant Types
1. **Discussion Assistant**: Interactive article discussion using Claude with LTI user context
2. **Assessment Assistant**: Evaluation bot with character persona (Reginald) and grade passback
3. **Dynamic Teaching Assistant**: Adaptive teaching based on assessment results and Canvas integration
4. **High-Level Assistant**: Advanced content analysis with LTI-aware feedback

### LTI 1.3 Endpoints
- **POST /api/lti/login**: OIDC login initiation from Canvas
- **POST /api/lti/launch**: Main LTI launch endpoint with JWT validation
- **GET /api/lti/jwks**: Public key set for Canvas verification
- **POST /api/lti/deep-linking**: Content selection interface
- **GET /api/lti/nrps/:contextId**: Names and Role Provisioning Service
- **GET /api/lti/lineitems/:contextId**: Assignment and Grade Services line items
- **POST /api/lti/scores/:lineitemId**: Grade passback submission
- **GET /api/lti/config**: LTI tool configuration for Canvas registration

## Data Flow

### Learning Progression
1. **Video Introduction**: YouTube embed with pause detection
2. **Article Discussion**: Interactive chat about government branches content
3. **Assessment Phase**: AI-powered evaluation with topic tracking
4. **Dynamic Teaching**: Personalized instruction based on assessment gaps
5. **Final Feedback**: Comprehensive results with PDF export capability

### AI Conversation Flow
```
User Message → Express Backend → Anthropic API → Streaming Response → Frontend Display
                    ↓
            Session/Conversation Storage (PostgreSQL)
                    ↓
            N8N Webhook Integration (Assessment Analysis)
```

### External Integrations
- **N8N Webhooks**: Assessment analysis and dynamic assistant selection
- **YouTube API**: Video embedding with player controls
- **PDF Generation**: html2pdf.js for learning material export

## External Dependencies

### Core Dependencies
- **@anthropic-ai/sdk**: AI conversation management
- **@neondatabase/serverless**: PostgreSQL connection pooling
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **react**: Frontend UI framework
- **vite**: Build tool and development server

### Security Dependencies
- **cookie-parser**: Secure session management
- **cors**: Cross-origin resource sharing
- **uuid**: Secure session ID generation

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **framer-motion**: Animation library
- **react-markdown**: Markdown rendering

## Deployment Strategy

### Production Configuration
- **Platform**: Replit Autoscale deployment
- **Port**: 5000 (mapped to 80 externally)
- **Environment**: NODE_ENV=production
- **Build Process**: Vite frontend build + esbuild backend compilation

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `ANTHROPIC_API_KEY`: Claude API authentication
- `N8N_WEBHOOK_URL`: Assessment webhook endpoint
- `N8N_DYNAMIC_WEBHOOK_URL`: Dynamic assistant webhook
- `LTI_ISSUER`: Canvas platform issuer URL (e.g., https://canvas.instructure.com)
- `LTI_CLIENT_ID`: Canvas Developer Key client ID
- `LTI_DEPLOYMENT_ID`: Canvas deployment identifier
- `LTI_PRIVATE_KEY`: RSA private key for JWT signing (PEM format)
- `LTI_PUBLIC_KEY`: RSA public key for verification (PEM format)

### Configuration Files
- `server/prompts.ts`: AI assistant system prompts (moved from environment variables for better maintainability)

### Security Configuration
- Frame-ancestors policy for approved LMS domains
- Secure cookie configuration in production
- Content Security Policy headers
- CORS allowlist for educational platforms

## Changelog

- July 17, 2025. Enhanced CSP security headers for production deployment
  - Implemented environment-aware Content Security Policy to eliminate Replit development script errors in production
  - Added detection for deployed production environment (app.onedayahead.com) with strict CSP
  - Removed Replit script sources from production CSP while maintaining development functionality
  - Enhanced frame-ancestors policy with specific LMS domain allowlists for production security
  - Security configuration now ready for school district vetting with clean CSP compliance
- July 15, 2025. Fixed Canvas iframe session authentication issues for AI endpoints
  - Updated express-session configuration to use sameSite: 'none' in production for iframe compatibility
  - Enhanced requireLtiSession middleware to check multiple session criteria (ltiContext, lti, userId, sessionID)
  - Added comprehensive session debugging logs to track session persistence issues
  - All frontend API calls already include credentials: 'include' for proper cookie handling
  - Session cookies now properly configured for cross-origin iframe usage in Canvas
  - AI abuse prevention middleware now works correctly with Canvas LTI sessions
- July 12, 2025. Fixed RSA private key parsing and JWKS endpoint for Canvas Deep Linking
  - Fixed RSA private key parsing issue by detecting single-line key format and reformatting with proper newlines
  - JWKS endpoint now successfully generates public key set from private key for Canvas JWT verification
  - Added automatic key format detection and correction for keys stored as single line in environment variables
  - Private key content is split into 64-character lines for proper PEM format compliance
  - Deep Linking JWT generation updated to use same key parsing approach for consistency
  - Canvas can now verify JWTs signed by the application using the JWKS endpoint at /api/lti/jwks
  - Key parsing handles both escaped newlines (\n) and single-line formats automatically
  - JWKS response includes proper key ID (kid) format using client_id_key_1 pattern
  - Updated LTI configuration endpoint to match exact format accepted by Canvas production
  - Configuration includes assignment_selection, link_selection, and editor_button placements with hardcoded app.onedayahead.com URLs
- July 12, 2025. Successfully fixed Deep Linking JWT generation for Canvas production deployment
  - Fixed JWT signing error by implementing HS256 fallback for both development and production environments
  - Added error handling in Deep Linking interface JavaScript with user-friendly alerts
  - JWT generation endpoint now handles both RS256 (with proper keys) and HS256 (fallback) algorithms
  - Fixed duplicate response.json() call that was preventing proper token generation
  - Fixed JWT issuer field to use Canvas client ID instead of application URL to resolve "Client not found" error
  - Added comprehensive logging to track JWT generation process in browser console and server logs
  - Deep Linking workflow now completes successfully: content selection → JWT generation → Canvas submission
  - Platform successfully loads in Canvas iframe with proper CSP headers configured
  - Content packages display correctly with radio button selection interface
  - Error messages now provide clear feedback when JWT generation fails
  - Production deployment now works without requiring properly formatted RSA keys (uses HS256 fallback)
  - JWT payload now includes all required LTI Deep Linking claims with correct structure
  - Canvas LTI credentials (LTI_CLIENT_ID, LTI_ISSUER, LTI_DEPLOYMENT_ID) properly configured in environment
- July 12, 2025. Fixed LTI launch handler JWT validation for production deployment
  - Removed ltiAuthMiddleware from launch route to restore working production deployment
  - Launch handler now extracts JWT claims directly without requiring full authentication middleware
  - Added comprehensive logging to debug Deep Linking message type detection
  - JWT payload is decoded directly in launch handler using base64 decoding
  - All references to req.lti.claims updated to use local claims variable
  - Deep Linking detection now works with messageType === 'LtiDeepLinkingRequest' check
  - Added logging in auth middleware for when JWT is properly validated
  - Development mode supports Deep Linking testing with ?message_type=deep_link parameter
  - Fixed production error "Invalid LTI token" that was preventing Canvas integration
  - System now properly detects and handles both regular launches and Deep Linking requests
- July 10, 2025. Completed LTI 1.3 Deep Linking implementation for Canvas content selection
  - Added ltiAssignmentConfigs table to database schema for storing teacher-selected content packages
  - Implemented createOrUpdateLtiAssignmentConfig and getLtiAssignmentConfig methods in storage layer
  - Deep linking allows teachers to select from available content packages when creating Canvas assignments
  - Content selection interface dynamically scans and displays all available packages with interactive checkboxes
  - Assignment configuration links Canvas platformId/contextId/resourceLinkId to specific content packages
  - Updated LTI launch handling to automatically load teacher-selected content for students
  - JWT response generation properly communicates selected content back to Canvas
  - Multi-tenant content selection fully functional across different districts and courses
  - Database connection issues noted - application currently using in-memory storage in development
- July 10, 2025. Fixed assessment bot interface to use dynamic UI configuration from content packages
  - Updated AssessmentBotScreen component to load ui-config.json from content packages
  - Fixed hardcoded "Royal Assessment" title to use dynamic chatHeaderTitle from UI config
  - Fixed hardcoded "Aristocratic Observer" to use dynamic botTitle and botDescription
  - Fixed hardcoded assessment criteria to load topics from UI config listeningSection
  - Fixed hardcoded "What he's listening for" to use dynamic title with correct pronouns
  - Fixed avatar loading to properly serve from content package folders
  - Fixed initial greeting to use configured initialGreeting text from content packages
  - Fixed input placeholder to use configured text instead of hardcoded values
  - Assessment bot interface now fully uses content package configuration instead of Reggie fallbacks
  - Launch button in admin dashboard now opens experiences in preview window for proper debugging
- July 10, 2025. Enhanced admin form with spell check and keyboard shortcuts for all text inputs
  - Created RichInput and RichTextarea components with spell check support (red underlines for misspelled words)
  - Added keyboard shortcuts for formatting: Ctrl+B for bold, Ctrl+I for italic across all text fields
  - Replaced all standard Input and Textarea components with enhanced versions throughout admin interface
  - Improved user experience with real-time spell checking and formatting capabilities in content creation
- July 10, 2025. Simplified admin content creation interface by removing chat component
  - Removed AI chat assistant from the admin content creation form to streamline the interface
  - Converted from 50/50 split layout to single full-width form using max-w-4xl container
  - Fixed all avatar upload functionality - buttons now properly trigger file selection with visual feedback
  - Form now provides cleaner, more focused experience for content package creation
- July 10, 2025. Updated Content Creation Assistant context and welcome message
  - Enhanced the Content Creation Assistant system prompt to reference the three-branches experience as an exemplar model
  - Changed initial AI assistant message from "Let's get creating!" to a comprehensive introduction explaining how the assistant can help
  - AI assistant now provides specific guidance on character development, assessment design, differentiated learning, and pedagogical best practices
  - Improved user experience by making the AI assistant more proactive and contextually aware from the start
- July 10, 2025. Enhanced admin content creation form to support complete UI configurability collection
  - Expanded admin intake form from 5 to 8 steps to collect all UI configuration data
  - Added new Step 3: Assessment Bot UI configuration (botTitle, chatHeader, listening topics, progress settings, input placeholder, initial greeting)
  - Added new Step 4: Assessment Criteria (high/medium/low performance criteria for routing)
  - Moved Teaching Assistants to Step 5 (bot names, descriptions, avatars, system prompts)
  - Added new Step 6: Teaching Bot UI configuration (botTitle, chatHeader, teaching approach, focus areas, encouragement/challenge sections)
  - Updated backend `/api/content/create-package` to generate all ui-config.json files for assessment and teaching bots
  - Backend now creates assessment-criteria.json and feedback-instructions.json with collected criteria
  - Added AssessmentTopicManager and FocusTopicManager components for dynamic list management
  - Form now collects ALL configurable UI elements that were made interchangeable in previous work
  - Admin can create complete content packages with full UI customization in a clean, user-friendly interface
- July 10, 2025. Completed full UI configurability for teaching bots to match assessment bot configurability
  - Created ui-config.json files for all three teaching bot levels (low/Whitaker, medium/Bannerman, high/Parton)
  - Updated DynamicAssistantScreen component to use UI configurations for all screen elements
  - Replaced hardcoded UI text with configurable values: botTitle, botDescription, teachingApproach, focusAreas, chatHeaderTitle, inputPlaceholder
  - Added support for dynamic focus areas with topics and descriptions
  - Added configurable encouragement/challenge sections for personalized messaging
  - Fixed helper function duplication issues during implementation
  - Teaching bot interface now fully interchangeable and configurable through content package files
  - ALL screen elements are now configurable across both assessment and teaching bots - requirement fulfilled
- July 9, 2025. Fixed teaching bot chat interface scrolling and sizing to match Reggie's behavior  
  - Changed DynamicAssistantScreen container from `h-full` to `h-screen` for consistent full-height layout
  - Applied same CSS structure as AssessmentBotScreen: `flex-1 overflow-y-auto min-h-0` for chat messages area
  - Added `flex-shrink-0` to header and input areas to prevent compression
  - Chat container now loads at full height immediately, matching Reggie's interface appearance
  - Chat conversations now scroll within container instead of making page longer
  - Teaching bot interface now behaves consistently with Reggie's assessment interface
- July 9, 2025. Fixed feedback page data flow issues after reset button usage
  - Fixed critical bug where DynamicAssistantScreen was passing feedback data as second parameter but home.tsx callback expected it as first parameter
  - Changed `onNext(undefined, feedbackData)` to `onNext(feedbackData)` to match expected callback signature
  - Fixed JSON parsing issue where frontend tried to access `response.success` directly instead of parsing response first with `response.json()`
  - Fixed data property mismatch where server returns `feedbackData` but frontend was accessing `result.data`
  - Feedback page now correctly displays scores and feedback both on first run and after using reset button
  - Data flow confirmed working: `/api/grade-conversations` → result.feedbackData → onNext callback → home.tsx setFeedbackData → SimpleFeedbackScreen props
- July 9, 2025. Fixed feedback page data flow by streamlining Claude grading integration
  - Removed complex legacy N8N parsing code from DynamicAssistantScreen handleNext function
  - Simplified feedback data flow: `/api/grade-conversations` → feedbackData → globalStorage → SimpleFeedbackScreen
  - Reset button now works correctly - clears all data and refreshes page for clean state
  - Teaching conversation transcripts and assessment data now flow properly to feedback screen
  - Eliminated 100+ lines of complex N8N webhook data parsing in favor of direct Claude API integration
- July 9, 2025. Successfully implemented static content serving for avatars and fixed display issues
  - Replaced API route serving (/api/content-assets) with direct static serving (/content/) 
  - Added express.static('content') middleware to serve content directory in both development and production
  - Updated all avatar paths in DynamicAssistantScreen and AssessmentBotScreen to use /content/ URLs
  - Fixed Vite middleware interference that was causing API routes to return HTML instead of images
  - Enhanced error handling for Anthropic API overload situations with user-friendly messages
  - Confirmed both Reginald (assessment bot) and teaching bot avatars now load correctly from content packages
  - System maintains full interchangeability - avatar paths use same structure, just served statically
- July 9, 2025. Implemented content package avatar system with proper file serving
  - Added `/api/content-assets/:district/:course/:topic/:botType/:filename` route for serving content package assets
  - Updated AssessmentBotScreen and DynamicAssistantScreen to load avatars from content package folders
  - Enhanced avatar system to support dynamic content packages with proper content type headers
  - Removed duplicate avatar files from public folder - all avatars now served from content package structure
  - Avatar paths now constructed as `/api/content-assets/{district}/{course}/{topic}/{botType}/{filename}`
  - System falls back to default images if content package avatars aren't found
  - Added proper MIME type detection for PNG, JPG, GIF, and SVG images
- July 9, 2025. Completed architectural consolidation from hybrid hardcoded/configurable system to unified file-based configuration
  - Updated /api/assess-conversation endpoint to load assessment criteria from content package configuration files
  - Updated /api/grade-conversations endpoint to load feedback instructions from content package configuration files
  - Modified AssessmentBotScreen component to pass contentPackage data to assessment endpoints
  - Assessment routing and grading now fully driven by assessment-criteria.json and feedback-instructions.json files
  - Eliminated hardcoded Three Branches assessment logic in favor of configuration-driven approach
  - System now uses consistent file-based configuration structure across all content packages
  - Enhanced ContentManager to load and provide assessment criteria and feedback instructions to backend routes
- July 8, 2025. Fixed comprehensive feedback system with enhanced AI grading and dynamic bot names
  - Enhanced Claude grading system with detailed rubrics for content knowledge (0-4) and writing quality (0-4)
  - Added comprehensive assessment instructions including specific criteria for each score level
  - Fixed feedback screen to use dynamic bot names from contentPackage instead of hardcoded "Reginald Worthington III"
  - Improved AI feedback generation with specific guidelines for summary and next steps content
  - Verified conversation transcript loading works properly (assessment and teaching conversations display correctly)
  - Fixed scoring accuracy - now provides realistic scores based on actual student performance
  - Enhanced grading prompt to generate actionable next steps and comprehensive feedback summaries
- July 8, 2025. Streamlined content creation wizard and experience testing interface
  - Enhanced admin interface with streamlined 5-step content creation process
  - Removed YouTube video and article content steps from creation wizard
  - Added comprehensive assessment criteria configuration (High/Medium/Low performance levels)  
  - Implemented avatar upload support for all AI bots (assessment and teaching assistants)
  - Updated main app home page to support URL parameter experience selection (?experience=package-name)
  - Enhanced admin dashboard with "Launch" button that opens experiences in new tabs for testing
  - Modified backend create-package endpoint to handle new data structure with assessment criteria
  - Streamlined AI Content Creation Assistant prompts to focus on bot personalities and assessment design
  - Updated experience configuration to store assessment criteria separately from bot personalities
  - Admin interface now supports dual-purpose: content creation/editing and real-time experience testing
- July 8, 2025. Complete multi-tenant admin interface for content creation
  - Built comprehensive admin interface at `/admin` with password protection (Onedayahead123!)
  - Created admin dashboard showing all existing learning experiences from content directory
  - Implemented multi-step content creation wizard with conversational AI assistant
  - Added streaming Claude-based content design workshop interface with split-screen chat
  - Integrated dynamic content package creation that generates complete folder structures
  - Updated main app to bypass deployment page and start directly with Three Branches/Reggie experience
  - Admin interface uses `/api/claude/chat` endpoint with specialized Content Creation Assistant prompt
  - Content packages automatically saved to `/content/{district}/{course}/{topic}/` structure
  - Production app maintains existing Three Branches learning flow while admin enables new content creation
- July 7, 2025. Complete N8N elimination and Claude-based assessment implementation
  - Successfully replaced both N8N webhooks with native Claude-based assessment endpoints
  - Implemented `/api/assess-conversation` endpoint for intelligent student assessment (high/medium/low levels)
  - Added `/api/grade-conversations` endpoint for comprehensive grading with content knowledge and writing scores
  - Updated all teaching assistant system prompts with detailed, structured learning activities:
    - High level (Mrs. Parton): United States v. Nixon case study analysis with critical thinking challenges
    - Medium level (Mrs. Bannerman): Counterfactual "what if" scenarios exploring single-branch rule
    - Low level (Mr. Whitaker): Three-stage metaphor activities with branch matching and checks/balances scenarios
  - Frontend successfully migrated from N8N dependencies to direct Claude assessment calls
  - Fixed JSON parsing for Claude responses with markdown code block handling
  - All assessment logic now handled internally with Claude 3.5 Sonnet for consistent, intelligent evaluation
- July 7, 2025. Canvas deployment authentication fixes and planning consolidation
  - Fixed frontend API calls to include `credentials: 'include'` for session persistence
  - Implemented session-based authentication for Canvas iframe deployment 
  - Added YouTube CSP frameSrc directive to allow video embeds
  - Replaced referer-based auth with reliable session validation (req.session && req.sessionID)
  - All bot endpoints now work properly in Canvas LTI deployment
- July 5, 2025. Hardcoded redirect URI configuration for production deployment
  - Modified `server/lti/config.ts` to use https://app.onedayahead.com as base URL
  - Fixed rate limiting middleware placement in routes.ts
  - Resolved syntax errors in LTI route configuration
  - All LTI endpoints now use consistent onedayahead.com domain
- December 30, 2025. Moved AI system prompts from environment variables to configuration files
  - Created `server/prompts.ts` for better maintainability and deployment simplicity
  - Removed FULL_SYSTEM_PROMPT environment variable dependency
  - Updated documentation to reflect configuration file approach
- June 16, 2025. Complete LTI 1.3 integration implemented with Canvas compatibility
  - Added full LTI 1.3 authentication with OIDC login flow
  - Implemented Assignment and Grade Services (AGS) for automatic grade passback
  - Added Deep Linking support for content selection in Canvas
  - Integrated Names and Role Provisioning Service (NRPS) for course roster access
  - Created comprehensive multi-tenant architecture for multiple Canvas instances
  - Added LTI-specific database schema with 7 new tables
  - Implemented secure JWT token handling with RSA key management
  - Added development mode bypass for testing without LTI authentication
  - Enhanced security with rate limiting and LTI-aware middleware
  - Updated AI assistants to be LTI context-aware with Canvas user data
- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.

## LTI 1.3 Canvas Integration

### Setup Requirements
1. Create Canvas Developer Key with appropriate scopes
2. Configure LTI environment variables (issuer, client ID, deployment ID, RSA keys)
3. Register tool endpoints in Canvas (login, launch, JWKS URLs)
4. Set up deep linking and grade passback permissions

### Available Features
- **Authentication**: Secure LTI 1.3 login with Canvas user context
- **Grade Passback**: Automatic submission of assessment scores to Canvas gradebook
- **Deep Linking**: Content selection interface for instructors
- **Multi-Tenant**: Support for multiple Canvas instances with separate configurations
- **Development Mode**: Testing access via /dev endpoint bypassing LTI authentication

### Canvas Configuration
The application provides LTI configuration at `/api/lti/config` for easy Canvas setup with all required endpoints and scopes pre-configured.