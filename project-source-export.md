# Educational Learning Platform - Complete Source Export

## Project Overview
An advanced AI-powered educational intake system that creates personalized assessment bots for teachers. The system guides users through a multi-stage intake process to collect variables (subject, grade level, learning targets, bot personality, etc.) and uses a GBPAC template to generate assessment bots that can evaluate student understanding through conversational interaction.

**Current Status**: Fully functional intake system with fixed assessment targets data flow
**Last Updated**: August 7, 2025

## Recent Major Changes (August 7, 2025)
- ✅ **Assessment Targets Data Flow Fixed**: Resolved critical issue where learning targets from Stage 2 were not being stored in stageContext
- ✅ **Missing Callback Implementation**: Added handleLearningTargetsUpdate callback to parent NewIntake component
- ✅ **Interface Updates**: Updated IntakeChatProps interface with onLearningTargetsUpdate prop
- ✅ **Data Extraction Logic**: Connected learning targets extraction from Stage 2 to stageContext storage for bot generation
- ✅ **Component Communication**: Fixed data flow between intake stages to ensure learning targets properly reach PersonalityTestingBot

## Previous Changes (August 6-7, 2025)
- ✅ **Boundaries System Removal**: Completely removed all boundaries customization functionality to resolve excessive time/cost issues
- ✅ **Persona Extraction System**: Fixed botPersonality extraction - now correctly extracts full detailed personalities
- ✅ **Variable Naming Consistency**: Fixed critical naming inconsistencies between GBPAC template and component state
- ✅ **JSON Button System**: Unified all 7 button trigger methods into single JSON detection system
- ✅ **Assessment Targets Fix**: Resolved critical data flow where learning targets weren't reaching stageContext
- ✅ **Component Communication**: Enhanced data flow between NewIntake parent and IntakeChat child components

## Core System Design
- **AI-Powered Intake Wizard**: Guides teachers through multi-stage content creation process
- **GBPAC Template System**: Goals, Boundaries, Personality, Audience, Context framework for bot generation
- **Dynamic UI Configuration**: All UI elements configurable via content packages
- **Stage-Based Workflow**: 3-stage intake process (basics, content collection, personality/avatar)
- **Real-time Bot Testing**: PersonalityTestingBot component for immediate bot validation

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
1. **Admin Interface**: Multi-step content creation wizard with AI assistant at `/admin` (password: Onedayahead123!)
2. **Avatar Upload System**: Complete file upload workflow for assessment and teaching bot avatars
3. **Multi-Tenant Support**: Content packages organized by district/course/topic with independent configurations
4. **File-Based Configuration**: All UI elements configurable through JSON files in content package structure
5. **Assessment & Teaching Bots**: Fully interchangeable AI assistants with custom personalities and avatars
6. **Static Asset Serving**: Images served from content package folders with proper MIME type detection
7. **Enhanced Text Input**: Rich text fields with spell check and formatting shortcuts throughout admin interface

## File Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArticleChatScreen.tsx
│   │   │   ├── AssessmentBotScreen.tsx
│   │   │   ├── DynamicAssistantScreen.tsx
│   │   │   ├── HighBotWithArticleScreen.tsx
│   │   │   ├── FinalFeedbackScreen.tsx
│   │   │   ├── IntroVideoScreen.tsx
│   │   │   └── ui/ (shadcn + enhanced rich components)
│   │   ├── pages/
│   │   │   ├── admin-create.tsx (Multi-step content creation)
│   │   │   ├── admin-dashboard.tsx (Content package management)
│   │   │   └── home.tsx
│   │   ├── lib/
│   │   │   ├── globalStorage.ts
│   │   │   └── queryClient.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── index.html
├── server/
│   ├── contentManager.ts (Content package operations)
│   ├── lti/
│   │   ├── auth.ts
│   │   ├── services.ts
│   │   └── types.ts
│   ├── db.ts
│   ├── index.ts
│   ├── migrations.ts
│   ├── prompts.ts
│   ├── routes.ts (Enhanced with upload middleware)
│   └── storage.ts
├── content/ (Content package storage)
│   ├── {district}/
│   │   ├── {course}/
│   │   │   └── {topic}/
│   │   │       ├── config.json
│   │   │       ├── assessment-bot/
│   │   │       │   ├── config.json
│   │   │       │   ├── ui-config.json
│   │   │       │   └── {avatar-file}
│   │   │       └── teaching-bots/
│   │   │           ├── high-level/
│   │   │           ├── medium-level/
│   │   │           └── low-level/
├── shared/
│   └── schema.ts
└── package.json
```

## Assessment Targets Data Flow Fix Details

### Problem Identified (August 7, 2025)
The critical issue was that learning targets extracted from Stage 2 assessment targets confirmation were not being stored in `stageContext` for use in bot generation. The `handleConfirmAssessmentTargets` function was trying to call a non-existent `onLearningTargetsUpdate` callback.

### Solution Implemented
1. **Added Missing Callback**: Created `handleLearningTargetsUpdate` function in parent `NewIntake` component
2. **Interface Update**: Added `onLearningTargetsUpdate?: (learningTargets: string) => void` to `IntakeChatProps` interface
3. **Prop Connection**: Passed the callback from `NewIntake` to `IntakeChat` component
4. **Data Flow**: Learning targets now properly flow: Stage 2 extraction → `stageContext.learningTargets` → bot generation

### Code Changes Made
- **File**: `client/src/pages/new-intake.tsx`
- **Lines**: 3270-3278 (handleLearningTargetsUpdate function)
- **Lines**: 48 (IntakeChatProps interface update)
- **Lines**: 4060 (prop passed to IntakeChat)
- **Lines**: 129 (prop accepted in IntakeChat function)

### Result
Assessment targets confirmation now works correctly, with learning targets properly stored in `stageContext` and available for PersonalityTestingBot and final bot generation.

## Core Components Details

### 1. New Intake System (client/src/pages/new-intake.tsx)
**Key Features:**
- **Multi-Stage Workflow**: 3-stage intake process (basics, content collection, personality/avatar)
- **State Management**: Complex state management with stageContext for data persistence
- **Component Communication**: Parent-child data flow with proper callback system
- **Bot Testing**: Integrated PersonalityTestingBot for real-time bot validation
- **Skip Functionality**: Development shortcut (`skipToBoundaries`) for testing

**Stage Flow:**
1. **Stage 1**: Basic course information (district, school, subject, topic, grade)
2. **Stage 2**: Content collection and learning targets confirmation 
3. **Stage 3**: Bot personality design, avatar generation, and boundaries

### 2. Server Routes (server/routes.ts)
**Primary Endpoints:**
- `POST /api/claude/chat` - Main Claude chat endpoint with streaming support and intake bot prompts
- `POST /api/intake/extract-pdf` - PDF content extraction for Stage 2 file uploads
- `POST /api/intake/extract-text` - Text file content extraction  
- `POST /api/intake/upload-imscc` - Canvas IMSCC file parsing
- `POST /api/intake/extract-youtube` - YouTube transcript extraction
- `POST /api/intake/summarize-content` - Content summarization for assessment context
- `POST /api/intake/generate-welcome-message` - Bot welcome message generation
- `GET /intake` - Main intake wizard interface
- `GET /` - Home route with demo content packages

**Key Features:**
- **Streaming Responses**: Real-time Claude responses with word-by-word display
- **File Processing**: Multi-format content extraction (PDF, text, IMSCC, YouTube)
- **Content Summarization**: Intelligent content summarization for assessment context
- **Bot Prompt System**: Dynamic prompt generation based on intake stage and context

**File Upload System:**
- Multer middleware for handling FormData uploads
- Avatar files saved to content package folder structure
- Static file serving via express.static('/content') middleware
- Proper MIME type detection and content headers

**Admin Interface:**
- Multi-step content creation wizard with 8 distinct steps
- AI-powered content creation assistant with streaming responses
- Rich text inputs with spell check and formatting shortcuts
- Complete avatar upload workflow for all bot types

### 2. LTI Routes (server/lti/routes.ts)
**Key Features:**
- Full LTI 1.3 authentication flow with JWT validation
- Deep Linking content selection interface
- Message type detection for proper request routing
- Canvas-compliant configuration endpoint
- JWT response generation for content selection

**Deep Linking Implementation:**
- Detects `LtiDeepLinkingRequest` message type in launch handler
- Shows content selection interface with available packages
- Generates signed JWT response for Canvas
- Supports assignment_selection, link_selection, and editor_button placements

### 3. LTI Authentication (server/lti/auth.ts)
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
- ✅ Multi-tenant admin interface with complete content creation workflow
- ✅ Avatar upload system with FormData handling and multer middleware
- ✅ File-based configuration system with complete UI configurability
- ✅ Static asset serving from content package folders
- ✅ Enhanced text inputs with spell check and formatting shortcuts
- ✅ Content package management with organized folder structure
- ✅ All bot components working with proper hook implementations
- ✅ Rich admin interface with AI-powered content creation assistant
- ✅ Complete interchangeability of assessment and teaching bots
- ✅ Production-ready multi-tenant architecture
- ✅ Canvas Deep Linking fully implemented with proper scope and placements
- ✅ Message type detection for LtiDeepLinkingRequest vs LtiResourceLinkRequest

### Recent Fixes (July 11, 2025)
- ✅ Canvas Deep Linking scope added: `https://purl.imsglobal.org/spec/lti-dl/scope/deep_linking`
- ✅ Launch handler now detects message types and routes appropriately
- ✅ Canvas placements configured: assignment_selection, link_selection, editor_button
- ✅ LTI configuration endpoint provides complete Canvas registration JSON

### Previous Fixes (July 10, 2025)
- ✅ HighBotWithArticleScreen component error resolved by switching to useStreamingChatLegacy hook
- ✅ Avatar upload workflow now properly saves files to content package folders
- ✅ Admin form enhanced with rich text components and keyboard shortcuts
- ✅ Static file serving configured for proper avatar loading from content packages
- ✅ All UI elements made configurable through content package JSON files

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

## Content Package Structure

### Avatar Upload Locations
- **Assessment Bot**: `/content/{district}/{course}/{topic}/assessment-bot/{filename}`
- **High Teaching Bot**: `/content/{district}/{course}/{topic}/teaching-bots/high-level/{filename}`
- **Medium Teaching Bot**: `/content/{district}/{course}/{topic}/teaching-bots/medium-level/{filename}`
- **Low Teaching Bot**: `/content/{district}/{course}/{topic}/teaching-bots/low-level/{filename}`

### Configuration Files
- **Main Package**: `/content/{district}/{course}/{topic}/config.json`
- **Assessment Bot Config**: `/content/{district}/{course}/{topic}/assessment-bot/config.json`
- **Assessment UI Config**: `/content/{district}/{course}/{topic}/assessment-bot/ui-config.json`
- **Teaching Bot Configs**: `/content/{district}/{course}/{topic}/teaching-bots/{level}-level/config.json`
- **Teaching UI Configs**: `/content/{district}/{course}/{topic}/teaching-bots/{level}-level/ui-config.json`

### Avatar Loading System
Images served via static middleware at `/content/` URLs:
- Assessment: `/content/Demo-District/4th-Grade-Science/Clouds/assessment-bot/avatar.png`
- Teaching: `/content/Demo-District/4th-Grade-Science/Clouds/teaching-bots/medium-level/avatar.png`

## Future Enhancements
- AWS EC2 deployment with load balancer configuration
- Enhanced analytics dashboard for content package performance
- Multi-language support for international deployment
- Advanced content versioning and rollback capabilities
- Bulk content package import/export functionality

---

## Canvas Deep Linking Implementation Details

### Configuration Requirements
The LTI configuration at `/api/lti/config` now includes:
- Deep Linking scope in the scopes array
- Message types declaration for both Deep Linking and Resource Launch
- Proper placement configurations for Canvas integration

### How Deep Linking Works
1. **Teacher Selection**: When teacher clicks "Add External Tool" in Canvas
2. **Message Detection**: Launch handler checks for `LtiDeepLinkingRequest` message type
3. **Content Picker**: Shows available content packages with radio button selection
4. **JWT Response**: Generates signed JWT with selected content details
5. **Canvas Integration**: Returns selected content to Canvas via deep_link_return_url

### Canvas Registration
Update your Canvas Developer Key with the configuration from:
```
https://app.onedayahead.com/api/lti/config
```

**Technical Contact**: Development team via Replit
**Last Tested**: July 11, 2025
**Status**: Production ready with complete Canvas Deep Linking support