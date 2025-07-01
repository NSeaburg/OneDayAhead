# Environment Variables Configuration

## Required Environment Variables

These environment variables must be configured in your hosting platform:

### AI Service Configuration
```bash
ANTHROPIC_API_KEY=sk-ant-[your-anthropic-api-key]
```
- **Source**: Anthropic Console (console.anthropic.com)
- **Usage**: All Claude API interactions
- **Model**: claude-sonnet-4-20250514

### Database Configuration
```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
```
- **Format**: Standard PostgreSQL connection string
- **Requirements**: PostgreSQL 16+ recommended
- **Permissions**: CREATE, SELECT, INSERT, UPDATE, DELETE

### N8N Webhook Integration
```bash
N8N_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Assessment-Finish
N8N_DYNAMIC_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Feedback Flow
```
- **Provider**: N8N Cloud
- **Purpose**: Assessment processing and teaching assistant configuration
- **Note**: These are external webhooks that process educational data

### Educational Content
System prompts are now stored in `server/prompts.ts` configuration file instead of environment variables for better maintainability and deployment simplicity.

## Optional Environment Variables

### Runtime Configuration
```bash
NODE_ENV=production
PORT=5000
```

### Replit-Specific (Can be omitted in other hosting)
```bash
REPL_ID=[auto-generated]
REPL_SLUG=[auto-generated]
```

## Environment Variable Setup Instructions

### For Vercel
```bash
vercel env add ANTHROPIC_API_KEY
vercel env add DATABASE_URL
vercel env add N8N_WEBHOOK_URL
vercel env add N8N_DYNAMIC_WEBHOOK_URL
```

### For Railway
```bash
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set DATABASE_URL=postgresql://...
# etc.
```

### For Docker/Render/Other
Create `.env` file:
```bash
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...
N8N_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Assessment-Finish
N8N_DYNAMIC_WEBHOOK_URL=https://goldtrail.app.n8n.cloud/webhook/Feedback Flow
NODE_ENV=production
PORT=5000
```

## Security Notes

1. **Never commit secrets to version control**
2. **Use your hosting platform's secrets management**
3. **The N8N webhooks are external services - ensure they remain accessible**
4. **Database requires full CRUD permissions for tables: users, sessions, conversations, feedbacks**

## Testing Environment Variables

After deployment, verify with these API calls:

```bash
# Test basic configuration
curl https://your-domain.com/api/assistant-config

# Test database connection
curl https://your-domain.com/api/conversations/test-session

# Test AI service (requires valid session)
curl -X POST https://your-domain.com/api/claude-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","threadId":"test-123","assistantType":"test"}'
```

## Common Issues

1. **Database connection failures**: Verify DATABASE_URL format and network access
2. **AI API errors**: Confirm ANTHROPIC_API_KEY is valid and has sufficient credits
3. **N8N webhook failures**: External service - check N8N status if issues occur
4. **Port binding**: Ensure PORT matches your hosting platform requirements