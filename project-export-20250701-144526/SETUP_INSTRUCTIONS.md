# Project Setup Instructions

## Prerequisites
- Node.js 18+ 
- PostgreSQL database (local or cloud)
- NPM or similar package manager

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create `.env` file with required variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ANTHROPIC_API_KEY=your_anthropic_api_key
   N8N_WEBHOOK_URL=your_n8n_webhook_url
   N8N_DYNAMIC_WEBHOOK_URL=your_dynamic_webhook_url
   
   # LTI 1.3 Configuration (if using Canvas integration)
   LTI_ISSUER=https://canvas.instructure.com
   LTI_CLIENT_ID=your_canvas_client_id
   LTI_DEPLOYMENT_ID=your_deployment_id
   LTI_PRIVATE_KEY=your_rsa_private_key
   LTI_PUBLIC_KEY=your_rsa_public_key
   ```

3. **Database Setup**
   ```bash
   npm run db:push
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## Key Features
- LTI 1.3 compliant learning platform
- AI-powered adaptive learning with Anthropic Claude
- Real-time chat conversations
- Assessment and feedback system
- Grade passback to Canvas LMS
- Multi-tenant architecture
- React frontend with TypeScript
- Express.js backend
- PostgreSQL database with Drizzle ORM

## Documentation
See `replit.md` for complete architecture documentation.
