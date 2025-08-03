# Learning Platform - Compressed replit.md

## Overview
This project is an LTI 1.3 compliant learning platform for EdTech, providing an interactive experience focused on the U.S. government's three branches. It features AI-powered conversations, assessments, personalized feedback, and full Canvas LMS integration. The platform aims to offer scalable, secure learning experiences within LMS environments, supporting LTI 1.3 authentication, grade passback, deep linking, and Names and Role Provisioning Service (NRPS). Its business vision includes wide adoption in educational institutions, enhancing personalized learning and assessment with advanced AI capabilities.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
- **August 3, 2025**: Fixed assessment targets and persona confirmation button issues
  - Root cause: JSON detection was only in card submission flow, not button message flows
  - Added immediate JSON detection to all 3 streaming completion functions (sendButtonMessage, handleConfirmPersona, handleSend)
  - Disabled interfering fallback system that scanned conversation history
  - Strengthened Stage 3 persona prompt to require confirm_persona JSON block
  - All 7 JSON button types now work consistently across all interaction flows
- **August 2, 2025**: Completed comprehensive JSON-based button system refactor
  - Unified all 7 button trigger methods into single JSON detection system
  - Fixed undefined variables (hasAssessmentTargetsConfirmationButtons, hasBoundariesButtons, hasAvatarButtons)
  - Replaced old bracket marker detection ([BOUNDARIES_BUTTONS], [AVATAR_BUTTONS_HERE]) with JSON parsing
  - All button systems now use consistent {"action": "button_type", "data": {...}} structure
  - Eliminated 6 different inconsistent button trigger methods
  - System now handles: confirm_basics, confirm_learning_targets, confirm_persona, set_boundaries, confirm_boundaries, generate_avatar, test_bot

## System Architecture
The platform is a full-stack web application.

### Frontend
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS with shadcn/ui.
- **State Management**: React hooks with TanStack Query.
- **Routing**: Wouter.

### Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript.
- **Session Management**: Cookie-based sessions with UUIDs.
- **Security**: Comprehensive CORS, CSP, and security headers for LMS embedding.

### Database
- **ORM**: Drizzle ORM.
- **Database**: PostgreSQL.
- **Migrations**: Custom system in `server/migrations.ts`.
- **Data Models**: `users`, `sessions`, `conversations`, `feedbacks`, `lti_platforms`, `lti_users`, `lti_contexts`, `tenants`, `lti_grades`.

### AI Integration
- **Primary Provider**: Anthropic Claude.
- **Features**: Real-time response streaming, context-aware AI assistants using Canvas user data.
- **Assistant Types**: Discussion, Assessment (with persona), Dynamic Teaching, High-Level Content Analysis.

### LTI 1.3 Integration
- **Authentication**: JWT-based OIDC login.
- **Grade Passback**: Assignment and Grade Services (AGS).
- **Deep Linking**: Content selection and course integration.
- **NRPS**: Names and Role Provisioning Service for roster access.
- **Multi-Tenant**: Support for multiple Canvas instances.

### Security Framework
- Designed for iframe embedding in LMS platforms.
- Allowlist-based CORS configuration.
- Restrictive Content Security Policy.
- Secure HTTP-only cookies with SameSite policies.

### Core System Design
- **Content Management**: Database-driven content packages (`content_packages`, `content_components`, `content_creation_sessions`, `content_permissions`).
- **AI-Powered Intake Wizard**: Guides teachers through content creation with conversational AI, generating dynamic educational content and UI configurations.
- **Dynamic UI Configuration**: All UI elements for assessment and teaching bots are configurable via content packages, enabling full customization of bot titles, descriptions, teaching approaches, and more.
- **Content Package Structure**: Standardized file-based configuration (`ui-config.json`, `assessment-criteria.json`, `feedback-instructions.json`) for interchangeable experiences.
- **Content Summarization**: Uploaded materials (PDFs, text files, YouTube transcripts, Canvas IMSCC files) are automatically summarized using Claude for concise assessment context rather than storing raw content.
- **GBPAC Assessment Framework**: Assessment bots use Goals, Boundaries, Personality, Audience, Context template system with comprehensive variable substitution for consistent deployment-ready experiences.

## External Dependencies

### Core
- **@anthropic-ai/sdk**: AI conversation management.
- **@neondatabase/serverless**: PostgreSQL connection pooling.
- **drizzle-orm**: Type-safe database operations.
- **express**: Web server framework.
- **react**: Frontend UI framework.
- **vite**: Build tool and development server.

### Security
- **cookie-parser**: Session management.
- **cors**: Cross-origin resource sharing.
- **uuid**: Secure session ID generation.

### UI
- **@radix-ui/***: Accessible component primitives.
- **tailwindcss**: Utility-first CSS framework.
- **framer-motion**: Animation library.
- **react-markdown**: Markdown rendering.

### Integrations
- **N8N Webhooks**: (Note: Primarily replaced by direct Claude assessment, but mention if any residual use).
- **YouTube API**: Video embedding.
- **html2pdf.js**: PDF generation.
- **OpenAI DALL-E**: AI image generation (for avatar creation).
- **RapidAPI YouTube Transcript service**: For extracting video transcripts.