# Learning Platform - Architecture & Configuration

## Overview

This repository contains a comprehensive learning platform application designed specifically for Educational Technology (EdTech) environments. The platform provides an interactive learning experience centered around the three branches of the U.S. government, featuring AI-powered conversations, assessments, and personalized feedback mechanisms.

The application is architected as a full-stack web application with a React frontend and Express.js backend, utilizing modern technologies for scalable, secure deployment in Learning Management Systems (LMS) such as Canvas and Blackboard.

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
- **Primary Provider**: Anthropic Claude (claude-sonnet-4-20250514)
- **Fallback**: OpenAI GPT models for compatibility
- **Streaming**: Real-time response streaming for enhanced user experience

## Key Components

### Data Models
The application uses four core database tables:
- **users**: Anonymous user management with UUID-based sessions
- **sessions**: Secure session tracking with expiration
- **conversations**: AI chat history with assistant type classification
- **feedbacks**: Assessment results and personalized learning recommendations

### Security Framework
- **LMS Integration**: Designed for iframe embedding in Canvas, Blackboard, and other LMS platforms
- **CORS Configuration**: Allowlist-based origin validation with LMS domain support
- **Content Security Policy**: Restrictive CSP headers for secure embedding
- **Session Security**: HTTP-only cookies with SameSite policies

### AI Assistant Types
1. **Discussion Assistant**: Interactive article discussion using Claude
2. **Assessment Assistant**: Evaluation bot with character persona (Reginald)
3. **Dynamic Teaching Assistant**: Adaptive teaching based on assessment results
4. **High-Level Assistant**: Advanced content analysis (Mrs. Parton persona)

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

### Security Configuration
- Frame-ancestors policy for approved LMS domains
- Secure cookie configuration in production
- Content Security Policy headers
- CORS allowlist for educational platforms

## Changelog

- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.