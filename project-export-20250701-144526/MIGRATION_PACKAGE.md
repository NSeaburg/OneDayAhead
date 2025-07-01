# Complete Migration Package

## Files Provided for Migration

### 1. Source Code
- **Complete codebase** in current directory
- **No proprietary dependencies** - all packages are open source
- **Clean architecture** - React frontend + Express backend + PostgreSQL

### 2. Database
- `database_export.sql` - Complete database with all data (1,613 sessions, 125 conversations, 33 feedbacks)
- `schema_only.sql` - Database structure without data
- `sample_data.sql` - Educational conversation data only

### 3. Documentation
- `DEPLOYMENT_GUIDE.md` - Complete environment and deployment details
- `environment_variables.md` - All required secrets and configuration
- `replit.md` - Project architecture and development notes

## Quick Migration Checklist

### Pre-Migration Setup
- [ ] Provision PostgreSQL 16+ database
- [ ] Obtain Anthropic API key (console.anthropic.com)
- [ ] Set up hosting platform (Vercel/Railway/Render/etc.)
- [ ] Configure Node.js 20 runtime

### Database Migration
```bash
# Create database and restore
createdb your_learning_app
psql your_database_url < database_export.sql

# Or for schema only:
psql your_database_url < schema_only.sql
```

### Environment Configuration
```bash
# Required secrets
ANTHROPIC_API_KEY=sk-ant-[your-key]
DATABASE_URL=postgresql://[your-connection-string]
N8N_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Assessment-Finish
N8N_DYNAMIC_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Feedback Flow
FULL_SYSTEM_PROMPT="[9505 character educational prompt]"

# Runtime
NODE_ENV=production
PORT=5000
```

### Application Deployment
```bash
# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm run start
```

### Verification
```bash
# Test endpoints
curl https://your-domain.com/api/assistant-config
curl https://your-domain.com/api/conversations/test-session
```

## Architecture Summary

**Frontend**: React 18 + TypeScript + TailwindCSS + Radix UI  
**Backend**: Express.js + TypeScript  
**Database**: PostgreSQL 16 + Drizzle ORM  
**AI**: Anthropic Claude Sonnet 4  
**Integration**: N8N workflows for educational assessment  
**Deployment**: Stateless, iframe-embeddable educational tool

## Critical Dependencies

### Runtime Requirements
- Node.js 20+
- PostgreSQL 16+
- Port 5000 accessible
- HTTPS support (for iframe embedding)

### External Services
- **Anthropic API**: Claude conversations
- **N8N Webhooks**: Assessment processing (external service)
- **Educational Domain**: onedayahead.com integration

## Security & Compliance

### Iframe Embedding
- Configured for educational platform embedding
- CORS headers for whitelisted domains
- Content Security Policy for iframe ancestors

### Data Privacy
- Anonymous session system (no user accounts)
- Educational content focus
- 7-day automatic data expiry
- No PII collection

## Performance Characteristics

### Resource Usage
- **Memory**: ~200MB Node.js process
- **CPU**: Low (I/O bound for AI API calls)
- **Database**: Light load (educational usage patterns)
- **Bandwidth**: Moderate (text-based AI conversations)

### Scaling
- Stateless application design
- Database connection pooling
- AI API rate limiting handled by SDK
- Suitable for educational institution load

## Support & Maintenance

### Monitoring Points
- AI API call success rates
- Database connection health
- N8N webhook response times
- Iframe embedding functionality

### Common Issues
1. **AI API limits**: Monitor Anthropic usage and billing
2. **Database connections**: Ensure connection pooling works
3. **N8N webhooks**: External dependency - may need failover
4. **Iframe policies**: CSP headers must allow educational domains

## Development Workflow

### Local Development
```bash
npm run dev  # Development server with hot reload
```

### Database Changes
```bash
npm run db:push  # Sync schema changes (no manual migrations)
```

### Build Process
```bash
npm run build  # Vite frontend + esbuild server bundling
```

## Migration Success Criteria

- [ ] Application loads at your domain
- [ ] Database queries execute successfully
- [ ] Claude API responses working
- [ ] N8N webhooks processing assessment data
- [ ] Iframe embedding functional from educational platforms
- [ ] All conversation types working (assessment, teaching, article)

## Contact Information

**Current Deployment**: demo.onedayahead.com  
**Database Records**: 1,613 sessions, 125 conversations, 33 assessments  
**Integration**: N8N Cloud webhooks (external service)  
**AI Model**: Claude Sonnet 4 (claude-sonnet-4-20250514)

All files are ready for immediate deployment on any Node.js hosting platform with PostgreSQL support.