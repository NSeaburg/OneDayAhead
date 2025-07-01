# Replit Environment & Deployment Documentation

## Project Overview

**Application Type**: Educational AI Learning Platform  
**Stack**: React + Express + PostgreSQL + Claude API  
**Current Deployment**: Replit Autoscale (demo.onedayahead.com)  
**Purpose**: Iframe-embeddable learning modules for educational platforms

## Replit Environment Configuration

### Runtime Environment
- **Modules**: `nodejs-20`, `web`, `postgresql-16`
- **Nix Channel**: `stable-24_05`
- **Node Version**: 20.x
- **PostgreSQL**: Version 16

### Port Configuration
- **Internal Port**: 5000
- **External Port**: 80 (via Replit proxy)
- **Protocol**: HTTP/HTTPS

### Deployment Settings
```toml
[deployment]
deploymentTarget = "autoscale"
build = ["echo", "skip"]  # Manual build process
run = ["npm", "run", "start"]

[[ports]]
localPort = 5000
externalPort = 80
```

### Security Headers (Iframe Embedding)
```toml
[[deployment.responseHeaders]]
path = "/*"
name = "Content-Security-Policy"
value = "frame-ancestors 'self' https://onedayahead.replit.app https://ai.onedayahead.com https://replit.com http://onedayahead.com"
```

## Build Process

### Development Mode
```bash
npm run dev  # NODE_ENV=development tsx server/index.ts
```

### Production Build
```bash
npm run build  # Vite build + esbuild server bundling
npm run start  # NODE_ENV=production node dist/index.js
```

### Build Script (`build.sh`)
```bash
#!/bin/bash
npx vite build                                    # Client-side React build
npx esbuild server/index.ts --platform=node \    # Server-side bundling
  --packages=external --bundle --format=esm \
  --outdir=dist
cp -r public/* dist/public/                       # Copy static assets
```

## Dependencies & Package Management

### Core Runtime Dependencies
- **Framework**: Express.js + React 18 + TypeScript
- **AI**: `@anthropic-ai/sdk` (Claude Sonnet 4)
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: TailwindCSS + Radix UI components
- **Build**: Vite + esbuild

### Development Dependencies
- **TypeScript**: 5.6.3
- **Build Tools**: Vite 5.4.14, esbuild 0.25.0
- **Database**: drizzle-kit 0.30.4
- **Type Definitions**: Complete @types coverage

### Package Installation
```bash
npm install  # Install all dependencies
npm run db:push  # Sync database schema
```

## Database Configuration

### Connection
- **Type**: PostgreSQL 16
- **Connection**: Environment variable `DATABASE_URL`
- **ORM**: Drizzle with migrations in `./migrations`

### Schema Management
```bash
npm run db:push  # Push schema changes (no manual migrations)
```

### Database Tables
1. **users** - Anonymous session users
2. **sessions** - Session management with 7-day expiry
3. **conversations** - Claude chat interactions (JSON messages)
4. **feedbacks** - N8N assessment results

## Environment Variables

### Required Secrets
```bash
# AI Service
ANTHROPIC_API_KEY=sk-ant-...

# Database
DATABASE_URL=postgresql://...

# N8N Webhooks
N8N_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Assessment-Finish
N8N_DYNAMIC_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Feedback Flow

# Content
FULL_SYSTEM_PROMPT="[9505 character educational prompt]"
```

### Optional Configuration
```bash
NODE_ENV=production
PORT=5000
```

## File Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── lib/           # Utilities
│   │   └── main.tsx       # Entry point
├── server/                 # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database layer
│   ├── middleware/        # Session, security
│   └── index.ts           # Server entry
├── shared/                 # Common types/schema
│   └── schema.ts          # Drizzle database schema
├── public/                 # Static assets
├── dist/                   # Build output
├── package.json            # Dependencies
├── vite.config.ts         # Frontend build config
├── drizzle.config.ts      # Database config
└── tsconfig.json          # TypeScript config
```

## API Endpoints

### Core Routes
- `GET /api/assistant-config` - Claude assistant configuration
- `POST /api/claude-chat` - AI chat interactions
- `POST /api/send-to-n8n` - N8N webhook integration
- `GET /api/conversations/:sessionId` - Conversation history
- `GET /api/feedback/:sessionId` - Assessment feedback

### Iframe Embedding Routes
- `GET /embed` - Iframe wrapper
- `GET /iframe-app` - Direct app access
- `GET /embed-direct` - Simplified embedding
- `GET /lightweight-embed` - Domain-specific embedding

## Integration Points

### N8N Workflow Integration
- **Assessment Webhook**: Processes Reginald conversation data
- **Dynamic Webhook**: Returns personalized teaching assistant prompts
- **Response Format**: JSON with teaching assistance levels (low/medium/high)

### Claude API Integration
- **Model**: claude-sonnet-4-20250514
- **Usage**: All chat interactions (assessment, teaching, article discussion)
- **Rate Limiting**: Handled by Anthropic SDK

## Security Configuration

### Iframe Embedding Security
- CORS headers for educational domain whitelist
- Content Security Policy for iframe ancestors
- Secure cookie configuration
- Session-based authentication (no persistent user accounts)

### Data Protection
- Anonymous user system (no PII collection)
- 7-day session expiry
- Educational content focus (no sensitive data)

## Migration Considerations

### Critical Migration Items
1. **Environment Variables**: All secrets must be transferred
2. **Database Export**: PostgreSQL dump provided (`database_export.sql`)
3. **Build Process**: Node.js 20 + npm build workflow
4. **Port Configuration**: Internal 5000 → External 80
5. **Static Assets**: `public/` and `attached_assets/` directories
6. **N8N Webhooks**: Maintain external service integration

### Platform-Specific Features
- Replit-specific plugins can be removed (`@replit/vite-plugin-*`)
- Workflow configuration (`.replit`) is Replit-specific
- Auto-deployment on file changes (may need CI/CD setup)

### Testing Endpoints
- Health Check: `GET /api/assistant-config`
- Database: `GET /api/conversations/test-session`
- AI Service: `POST /api/claude-chat`

## Performance Characteristics

### Resource Usage
- **Memory**: ~200MB Node.js process
- **CPU**: Low (mainly I/O bound for AI API calls)
- **Database**: PostgreSQL with ~1.6K sessions, ~125 conversations
- **Storage**: ~500MB total (includes node_modules)

### Scaling Notes
- Stateless application (session-based, no user accounts)
- Database connection pooling via Drizzle
- AI API rate limits apply (Claude)
- Suitable for educational load patterns

## Deployment Verification Checklist

- [ ] Node.js 20+ runtime
- [ ] PostgreSQL 16 database accessible
- [ ] All environment variables configured
- [ ] Build process completes successfully
- [ ] Port 5000 accessible
- [ ] N8N webhooks responding
- [ ] Claude API calls working
- [ ] Iframe embedding headers present
- [ ] Database schema applied (`npm run db:push`)
- [ ] Static assets served correctly

## Contact & Support

For technical questions about this deployment:
- Database exports and schema in project root
- Complete source code available
- N8N webhook configurations documented
- All dependencies explicitly versioned