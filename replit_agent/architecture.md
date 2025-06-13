# Architecture Overview

## Overview

This repository contains a learning platform application built with a React frontend and Node.js backend. The application implements an interactive learning experience that guides users through educational content with AI-assisted feedback and personalized teaching. The system leverages AI services (OpenAI's GPT and Anthropic's Claude) to provide conversational interfaces for discussion, assessment, and personalized teaching.

The application follows a modern web architecture with a single-page React application served by an Express backend that handles both static file serving and API endpoints. The application is designed to be embedded in other platforms through iframes.

## System Architecture

The application follows a client-server architecture with clear separation between:

1. **Frontend**: A React-based single-page application built with Vite, TypeScript, and Tailwind CSS
2. **Backend**: An Express.js server handling API requests and serving the frontend 
3. **Database**: PostgreSQL database accessed via Drizzle ORM
4. **External Services**: Integration with OpenAI and Anthropic for AI-powered conversations
5. **Webhooks**: Integration with N8N for workflow automation

### Architecture Diagram

```
┌────────────────────┐         ┌───────────────────┐
│                    │         │                   │
│  React Frontend    │◄───────►│  Express Backend  │
│  (Vite/TypeScript) │         │   (Node.js/TS)    │
│                    │         │                   │
└────────────────────┘         └─────────┬─────────┘
                                         │
                                         ▼
                               ┌───────────────────┐
                               │                   │
                               │   PostgreSQL DB   │
                               │   (via Drizzle)   │
                               │                   │
                               └─────────┬─────────┘
                                         │
                                         ▼
                          ┌─────────────────────────────┐
                          │                             │
                          │   External AI Services      │
                          │   - OpenAI (GPT)           │
                          │   - Anthropic (Claude)     │
                          │                             │
                          └─────────────────────────────┘
```

## Key Components

### Frontend

The frontend is built with React and TypeScript using Vite as the build tool. It employs a component-based architecture with:

1. **UI Components**: Built with Radix UI and styled with Tailwind CSS
2. **State Management**: React hooks and context for local state management
3. **Data Fetching**: Custom hooks with React Query for API communication
4. **Routing**: Uses Wouter for lightweight client-side routing

Key frontend features:
- Progressive learning flow with multiple screens (video, article, chat, assessment)
- Chat interfaces for interacting with AI assistants
- PDF generation for learning materials
- Embedding support for integration with parent platforms

### Backend

The backend is built with Express.js and TypeScript, providing:

1. **API Routes**: RESTful endpoints for communication with the frontend
2. **AI Service Integration**: Connections to OpenAI and Anthropic APIs
3. **Database Access**: Data storage and retrieval via Drizzle ORM
4. **Static File Serving**: Production builds of the frontend application
5. **Webhook Handling**: Integration with N8N for workflow automation

### Database Schema

The application uses a PostgreSQL database with Drizzle ORM for data access. The schema includes:

- **Users**: Basic user information including username and password

### AI Integration

The application integrates with Anthropic's Claude API for all conversational AI:

1. **Article Chat**: Claude Sonnet 4 for article discussions
2. **Assessment Bot**: Claude Sonnet 4 with Reginald Worthington character
3. **Teaching Assistants**: Claude Sonnet 4 with personalized system prompts from N8N

All AI interactions use Claude Sonnet 4 (claude-sonnet-4-20250514) via Anthropic API.

### N8N Integration

The application uses N8N for workflow automation through webhooks:
- Assessment webhook for processing assessment results
- Dynamic assistant webhook for configuring personalized teaching

## Data Flow

1. **User Interaction Flow**:
   - User progresses through video content
   - User reads article content with AI chat support
   - User completes assessment with AI assistant
   - Based on assessment, personalized teaching is provided
   - User receives final feedback and completion summary

2. **AI Assessment Flow**:
   - User interacts with assessment bot
   - Assessment data is sent to N8N webhook
   - N8N processes assessment and returns teaching configuration
   - Application configures appropriate teaching assistant
   - Teaching assistant provides personalized instruction

3. **Embedding Communication Flow**:
   - When embedded in an iframe, the application communicates with parent
   - Events like screen changes, assessment completion are sent to parent
   - Parent can capture learning progress and completion status

## External Dependencies

### Core Framework
- React (frontend view library)
- Express.js (backend server)
- TypeScript (type safety)
- Vite (build tool)

### UI Components
- Radix UI (accessible component primitives)
- Tailwind CSS (utility-first styling)
- Shadcn UI (component library built on Radix)

### Database
- PostgreSQL (relational database)
- Drizzle ORM (database access layer)
- NeonDB Serverless (PostgreSQL provider)

### AI Services
- OpenAI API (GPT models)
- Anthropic API (Claude models)

### Other Notable Dependencies
- React Query (data fetching)
- HTML2PDF (PDF generation)
- Wouter (routing)
- Framer Motion (animations)

## Deployment Strategy

The application is designed to run on Replit, with configuration for both development and production:

1. **Development Mode**:
   - Uses Vite's development server with HMR
   - Express backend runs concurrently
   - Auto-refreshes on code changes

2. **Production Build**:
   - Frontend built with Vite
   - Backend built with esbuild
   - Optimized bundle served by Express

3. **Environment Configuration**:
   - Uses environment variables for configuration
   - Supports both development and production modes

4. **Database Deployment**:
   - Uses Drizzle migrations for schema management
   - Connects to PostgreSQL database via provided DATABASE_URL

The application is designed to be embedded in other platforms through iframes with API communication, allowing for flexible deployment scenarios.