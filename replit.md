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

### Security Configuration
- Frame-ancestors policy for approved LMS domains
- Secure cookie configuration in production
- Content Security Policy headers
- CORS allowlist for educational platforms

## Changelog

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