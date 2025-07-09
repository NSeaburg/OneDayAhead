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