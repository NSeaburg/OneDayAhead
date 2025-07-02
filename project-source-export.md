# Educational Learning Platform - Complete Source Export

## Project Overview
An advanced AI-powered adaptive learning platform focused on teaching the three branches of U.S. government through interactive AI chatbots. Features LTI 1.3 Canvas integration, streaming Claude 3.5 Sonnet responses, and character-driven AI interactions.

**Current Status**: Fully functional with LTI authentication fixes implemented
**Last Updated**: July 2, 2025

## Recent Fixes (Current Session)
- ✅ Fixed syntax error in routes.ts causing server startup failure
- ✅ Added express-session for persistent development context
- ✅ Updated LTI auth middleware to support session-based development flag
- ✅ Made all chat endpoints use consistent LTI authentication
- ✅ Created proper TypeScript session types
- ✅ Resolved 401 authentication errors for assessment and teaching bots

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with Vite build system
- **Styling**: Tailwind CSS with shadcn/ui components
- **State**: TanStack Query for server state, React hooks
- **Routing**: Wouter for client-side routing

### Backend (Express + TypeScript)
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (fallback to in-memory)
- **Sessions**: express-session with memory store
- **AI Integration**: Anthropic Claude 3.5 Sonnet with streaming

### Key Features
1. **Video Introduction**: YouTube embed with progress tracking
2. **Article Discussion**: Interactive AI chat about government branches
3. **Assessment Phase**: Character-driven evaluation (Reginald Worthington III)
4. **Teaching Phase**: Adaptive instruction (Mr. Whitaker character)
5. **Final Results**: PDF export with comprehensive feedback

## File Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArticleChatScreen.tsx
│   │   │   ├── AssessmentBotScreen.tsx
│   │   │   ├── DynamicAssistantScreen.tsx
│   │   │   ├── FinalFeedbackScreen.tsx
│   │   │   ├── IntroVideoScreen.tsx
│   │   │   └── ui/ (shadcn components)
│   │   ├── lib/
│   │   │   ├── globalStorage.ts
│   │   │   └── queryClient.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── index.html
├── server/
│   ├── lti/
│   │   ├── auth.ts
│   │   ├── services.ts
│   │   └── types.ts
│   ├── db.ts
│   ├── index.ts
│   ├── migrations.ts
│   ├── prompts.ts
│   ├── routes.ts
│   └── storage.ts
├── shared/
│   └── schema.ts
└── package.json
```

## Core Components Details

### 1. Server Routes (server/routes.ts)
**Primary Endpoints:**
- `GET /dev` - Development access with mock LTI session
- `POST /api/article-chat-stream` - Streaming article discussion
- `POST /api/claude-chat` - Assessment and teaching chat
- `GET /api/assistant-config` - AI assistant configuration
- LTI 1.3 endpoints for Canvas integration

**Recent Changes:**
- Added express-session middleware for persistent development context
- Fixed LTI authentication to work with session-based development flag
- Proper session typing for TypeScript compatibility

### 2. LTI Authentication (server/lti/auth.ts)
**Key Features:**
- JWT-based authentication for Canvas integration
- Development mode bypass with session persistence
- Comprehensive error handling and logging

**Authentication Flow:**
```typescript
export const ltiAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check for development session first
  if (req.session?.lti?.isDevelopment) {
    req.lti = req.session.lti;
    return next();
  }
  
  // Standard LTI JWT validation
  // ... JWT verification logic
};
```

### 3. AI Character Prompts (server/prompts.ts)
**Character Definitions:**
- **Article Assistant**: Friendly, engaging discussion facilitator
- **Reginald Worthington III**: Aristocratic, condescending assessment character
- **Mr. Whitaker**: Supportive teaching assistant (fallback implemented)

**System Prompt Lengths:**
- Article Assistant: 9,466 characters
- Assessment Assistant: Comprehensive character personality
- Teaching Assistant: Adaptive based on assessment results

### 4. Frontend Chat Components

#### ArticleChatScreen.tsx
- Streaming responses with word-by-word display
- Persistent conversation storage
- Progress tracking integration

#### AssessmentBotScreen.tsx
- Character-driven evaluation with Reginald persona
- N8N webhook integration for assessment analysis
- Automatic progress detection

#### DynamicAssistantScreen.tsx
- Adaptive teaching based on assessment gaps
- Mr. Whitaker character implementation
- Fallback system for technical issues

### 5. Global Storage System (client/src/lib/globalStorage.ts)
**Features:**
- Cross-component state persistence
- Assessment and teaching conversation storage
- Feedback data management
- Thread ID tracking

**Key Functions:**
```typescript
setAssessmentConversation(messages, threadId)
getAssessmentConversation()
setTeachingMessages(messages)
getTeachingMessages()
setFeedbackData(data)
getFeedbackData()
```

## Database Schema (shared/schema.ts)

### Core Tables
- **users**: User management with LTI integration
- **sessions**: Secure session tracking
- **conversations**: AI chat history with context
- **feedbacks**: Assessment results and scores
- **lti_platforms**: Canvas instance configurations
- **lti_users**: LTI user identity management
- **lti_contexts**: Course information from Canvas

### Key Relations
- Users linked to LTI identities
- Conversations tied to sessions and users
- Feedback connected to assessment results

## Environment Configuration

### Required Variables
```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
N8N_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Assessment-Finish
N8N_DYNAMIC_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Feedback Flow
LTI_ISSUER=https://canvas.instructure.com
LTI_CLIENT_ID=...
LTI_DEPLOYMENT_ID=...
LTI_PRIVATE_KEY=...
LTI_PUBLIC_KEY=...
```

### Development Mode
- Automatic fallback to in-memory storage if database unavailable
- Mock LTI session creation via `/dev` route
- Comprehensive logging for debugging

## API Integration

### Anthropic Claude 3.5 Sonnet
- **Model**: claude-3-5-sonnet-20241022
- **Max Tokens**: 8,192 (corrected from previous 20,000 limit)
- **Streaming**: Real-time word-by-word response generation
- **System Prompts**: Character-specific prompts from prompts.ts

### N8N Webhooks
- **Assessment Analysis**: Processes student responses for learning gaps
- **Dynamic Teaching**: Selects appropriate teaching assistant based on results
- **Fallback**: Graceful degradation when webhooks unavailable

## Security Implementation

### LTI 1.3 Compliance
- JWT token validation with RSA keys
- Secure session management with HTTP-only cookies
- CORS configuration for LMS embedding
- Content Security Policy headers

### Development Security
- Session-based development authentication
- Persistent mock LTI context
- Environment-based feature flags

## Testing and Development

### Access Methods
1. **Production**: Via Canvas LTI launch
2. **Development**: Direct access via `/dev` route
3. **Embed**: Iframe embedding via `/embed` route

### Current Status
- ✅ All chat endpoints functioning with consistent authentication
- ✅ Character prompts properly loaded from configuration
- ✅ Streaming responses working across all AI assistants
- ✅ Session persistence for development testing
- ✅ Database fallback to in-memory storage

### Known Issues
- Database connection timeout in development (handled gracefully)
- Teaching assistant fallback message when N8N webhook fails
- Max tokens limit corrected to 8,192 for Claude 3.5 Sonnet

## Deployment

### Current Setup
- **Platform**: Replit with autoscale deployment
- **Port**: 5000 (Express server)
- **Build**: Vite frontend + TypeScript compilation
- **Storage**: PostgreSQL primary, in-memory fallback

### Performance
- Streaming responses for improved user experience
- Efficient state management with TanStack Query
- Optimized database queries with Drizzle ORM
- Session-based authentication caching

## Future Enhancements
- Enhanced error recovery for N8N webhook failures
- Improved teaching assistant personality beyond fallback
- Additional assessment scoring algorithms
- Enhanced PDF export formatting
- Multi-language support for international deployment

---

**Technical Contact**: Development team via Replit
**Last Tested**: July 2, 2025
**Status**: Production ready with full LTI 1.3 compliance