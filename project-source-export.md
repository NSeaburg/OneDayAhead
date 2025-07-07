# Educational Learning Platform - Complete Source Export

## Project Overview
An advanced AI-powered adaptive learning platform focused on teaching the three branches of U.S. government through interactive AI chatbots. Features LTI 1.3 Canvas integration, streaming Claude 3.5 Sonnet responses, and character-driven AI interactions with native Claude-based assessment system.

**Current Status**: Fully functional with complete N8N elimination and native Claude assessment
**Last Updated**: July 7, 2025

## Recent Major Changes (Current Session)
- ✅ **Complete N8N Elimination**: Replaced all external N8N webhooks with internal Claude API calls
- ✅ **Native Assessment System**: Added `/api/assess-conversation` endpoint using Claude 3.5 Sonnet
- ✅ **Comprehensive Grading**: Added `/api/grade-conversations` endpoint for final scoring
- ✅ **Enhanced Teaching Assistants**: Updated all three difficulty levels with detailed structured prompts:
  - **High Level (Mrs. Parton)**: Advanced case study analysis (United States v. Nixon)
  - **Medium Level (Mrs. Bannerman)**: Counterfactual "what if" scenarios
  - **Low Level (Mr. Whitaker)**: Three-stage metaphor activities with guided learning
- ✅ **Fixed Conversation Display**: Teaching transcripts now show real conversations instead of fallback messages
- ✅ **Intelligent Assessment**: Claude evaluates student understanding and assigns appropriate difficulty levels
- ✅ **Self-Contained Operation**: App now runs entirely on internal Claude integration without external dependencies

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
- `POST /api/claude-chat` - Assessment and teaching chat with streaming
- `POST /api/assess-conversation` - **NEW**: Native Claude assessment for difficulty level assignment
- `POST /api/grade-conversations` - **NEW**: Comprehensive Claude-based grading and feedback
- `GET /api/assistant-config` - AI assistant configuration
- LTI 1.3 endpoints for Canvas integration

**Assessment System:**
- Intelligent evaluation using Claude 3.5 Sonnet to analyze student conversations
- Automatic assignment to high/medium/low difficulty teaching assistants
- Comprehensive scoring for content knowledge and writing quality
- Detailed feedback generation with personalized next steps

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
- **Article Assistant**: Friendly, engaging discussion facilitator for government branches content
- **Reginald Worthington III**: Aristocratic, condescending assessment character with British superiority
- **Teaching Assistants** (Adaptive based on student level):
  - **Mrs. Parton (High)**: Advanced case study analysis with United States v. Nixon constitutional examination
  - **Mrs. Bannerman (Medium)**: Counterfactual scenarios exploring "what if" single-branch rule
  - **Mr. Whitaker (Low)**: Three-stage metaphor activities with guided branch matching exercises

**Enhanced Assessment System:**
- Native Claude evaluation replaces external N8N webhooks
- Intelligent conversation analysis for appropriate difficulty assignment
- Structured learning activities tailored to student comprehension level
- Real conversation tracking with authentic teaching interactions displayed

### 4. Frontend Chat Components

#### ArticleChatScreen.tsx
- Streaming responses with word-by-word display
- Persistent conversation storage
- Progress tracking integration

#### AssessmentBotScreen.tsx
- Character-driven evaluation with Reginald Worthington III persona
- Native Claude assessment replacing N8N webhook integration
- Automatic progress detection and conversation analysis

#### DynamicAssistantScreen.tsx
- Adaptive teaching based on Claude-assessed student performance levels
- Three-tiered character system (Mrs. Parton/Mrs. Bannerman/Mr. Whitaker)
- Real conversation tracking with authentic teaching interactions

#### HighBotWithArticleScreen.tsx
- **NEW**: Advanced teaching for high-performing students
- Mrs. Parton character with constitutional case study focus
- Claude-based grading integration for final assessment

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
LTI_ISSUER=https://canvas.instructure.com
LTI_CLIENT_ID=...
LTI_DEPLOYMENT_ID=...
LTI_PRIVATE_KEY=...
LTI_PUBLIC_KEY=...
```

### Removed Variables (N8N Elimination)
```
# No longer needed - replaced with native Claude assessment
N8N_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Assessment-Finish
N8N_DYNAMIC_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Feedback Flow
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

### Native Claude Assessment (Replaced N8N)
- **Assessment Analysis**: Claude 3.5 Sonnet evaluates student conversations for comprehension levels
- **Dynamic Teaching**: Intelligent assignment to high/medium/low difficulty teaching assistants
- **Grading System**: Comprehensive scoring for content knowledge and writing quality
- **Real-time Processing**: No external dependencies, all processing handled internally

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
- ✅ Complete N8N elimination with native Claude assessment system
- ✅ All chat endpoints functioning with consistent authentication
- ✅ Enhanced teaching assistants with structured learning activities
- ✅ Real conversation tracking in feedback transcripts
- ✅ Intelligent difficulty level assignment based on student performance
- ✅ Comprehensive grading system with content and writing scores
- ✅ Streaming responses working across all AI assistants
- ✅ Session persistence for development testing
- ✅ Database fallback to in-memory storage

### Resolved Issues
- ✅ N8N webhook dependency eliminated - now self-contained
- ✅ Teaching assistant fallback messages replaced with real conversations
- ✅ Conversation transcript display fixed to show authentic interactions
- ✅ Assessment logic moved from external service to internal Claude processing

## Deployment

### Current Setup
- **Platform**: Replit with autoscale deployment  
- **Domain**: Hardcoded to https://app.onedayahead.com
- **Port**: 5000 (Express server)
- **Build**: Vite frontend + TypeScript compilation
- **Storage**: PostgreSQL primary, in-memory fallback
- **LTI Redirect URI**: https://app.onedayahead.com/api/lti/launch

### Performance
- Streaming responses for improved user experience
- Efficient state management with TanStack Query
- Optimized database queries with Drizzle ORM
- Session-based authentication caching

## Future Enhancements
- Additional assessment scoring algorithms for more nuanced evaluation
- Enhanced PDF export formatting with conversation highlights
- Multi-language support for international deployment
- Advanced analytics dashboard for instructor insights
- Expanded case study library for high-level teaching assistant

---

**Technical Contact**: Development team via Replit
**Last Tested**: July 2, 2025
**Status**: Production ready with full LTI 1.3 compliance