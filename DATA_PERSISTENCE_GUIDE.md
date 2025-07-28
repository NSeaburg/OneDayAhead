# Data Persistence Guide - Intake System

## Overview

The intake system uses a hybrid approach combining database storage for persistent data and frontend state for temporary session data. This guide explains what data is stored where and how to access it.

## Database Storage (Persistent)

### Content Creation Sessions Table
**Location**: `content_creation_sessions` table
**Data Stored**:
- Session ID and user information
- Current wizard step (1, 2, or 3)
- Wizard data (JSON object containing all collected criteria)
- Conversation history (AI chat messages between teacher and intake bot)
- Session status (active, completed, abandoned)
- Timestamps for creation, updates, and completion

**Access**: 
- Backend: Through Drizzle ORM queries
- Schema: `shared/schema.ts` - `contentCreationSessions` table

### Generated Content Packages
**Location**: File system at `/content/{district}/{course}/{topic}/`
**Data Stored**:
- Complete bot configurations (assessment-bot/, teaching-bots/)
- Avatar images (PNG files)
- UI configuration files (ui-config.json)
- Assessment criteria (assessment-criteria.json)
- System prompts and personalities

**Access**:
- Files are served statically via Express middleware
- Created through `/api/content/create-package` endpoint

## Frontend State (Temporary Session Data)

### Stage 1 & 2 Data
**Location**: React state in `NewIntake` component
**Data Stored**:
- `criteria` object with detected values (school, district, subject, topic, grade level)
- `uploadedFiles` array (YouTube transcripts, PDFs, text files)
- `stageContext` object passed between stages

**Persistence**: Lost on page refresh, stored temporarily during session

### Stage 3 Bot Design Data
**Location**: React state variables in `NewIntake` component
**Key Variables**:
- `botName`: Extracted bot name (e.g., "Professor Conch")
- `botJobTitle`: Extracted job title (e.g., "Marine Biology Professor")
- `personalitySummary`: Brief 2-3 sentence description
- `fullBotPersonality`: Complete personality description from AI
- `botWelcomeMessage`: Greeting message for students
- `botSampleDialogue`: Example conversation snippet
- `botVisualDescription`: Physical description for avatar generation
- `generatedAvatar`: URL to generated avatar image

**Persistence**: Lost on page refresh, extracted from Stage 3 conversation

### Message Injection System
**Location**: React state and useCallback hook
**Components**:
- `messageInjectionFunction`: Function reference stored in parent component
- `injectMessage`: Callback function in IntakeChat component
- Automatic trigger when PersonalityTestingBot modal closes

**Purpose**: Enables PersonalityTestingBot to send `[USER_RETURNED_FROM_TESTING]` trigger to continue Stage 3 conversation

## Data Flow Architecture

### Stage Progression
1. **Stage 1**: Criteria collected → stored in React state
2. **Stage 2**: Files uploaded → stored in React state
3. **Stage 3**: Bot design → persona data extracted → stored in React state
4. **Completion**: All data combined → saved to content creation session

### Persona Confirmation Workflow
1. User tests bot in PersonalityTestingBot modal
2. Modal closes → triggers message injection
3. `[USER_RETURNED_FROM_TESTING]` sent to Stage 3 bot
4. Bot responds with feedback collection prompts
5. User confirms persona choice
6. AI extraction bot processes confirmed data
7. Frontend updates all bot-related state variables

## Current Status

✅ **Working Systems**:
- Message injection architecture
- PersonalityTestingBot trigger system
- AI extraction from confirmed persona data
- Avatar generation with OpenAI DALL-E
- Stage progression with proper data flow

⚠️ **Data Persistence Limitations**:
- Stage 3 bot design data only exists in frontend state
- No automatic save to database during design process
- Page refresh loses all persona customization work
- User must complete entire flow in single session

## Future Enhancement Opportunities

### Auto-Save Implementation
- Add periodic saves of Stage 3 data to content creation sessions table
- Store bot design data in `wizardData` JSON field
- Enable resume functionality for interrupted sessions

### Database Integration
- Extend content creation sessions to include persona data fields
- Add real-time sync between frontend state and database
- Implement draft/published states for content packages

## Access Patterns by Role

### Teachers (Users)
- See: Current session progress, their created content packages
- Cannot see: Other teachers' work, system internals

### Developers (Debugging)
- Frontend state: Browser DevTools → Components → NewIntake state
- Database data: SQL queries to `content_creation_sessions` table
- File system: Content directory structure
- Message flow: Console logs with injection system debugging

### System Administration
- Monitor sessions via database queries
- Access all content packages in file system
- Review conversation history for support purposes

This guide should be updated whenever the data architecture changes or new persistence mechanisms are added.