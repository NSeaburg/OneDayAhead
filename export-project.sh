#!/bin/bash

# Project Source Export Script
# Creates a comprehensive export of the learning platform source code

echo "🚀 Starting project source export..."

# Create export directory with timestamp
EXPORT_DIR="project-export-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$EXPORT_DIR"

echo "📁 Creating export directory: $EXPORT_DIR"

# Core project files
echo "📋 Copying core project files..."
cp package.json "$EXPORT_DIR/"
cp tsconfig.json "$EXPORT_DIR/" 2>/dev/null || true
cp vite.config.ts "$EXPORT_DIR/" 2>/dev/null || true
cp tailwind.config.ts "$EXPORT_DIR/" 2>/dev/null || true
cp postcss.config.js "$EXPORT_DIR/" 2>/dev/null || true
cp components.json "$EXPORT_DIR/" 2>/dev/null || true
cp drizzle.config.ts "$EXPORT_DIR/" 2>/dev/null || true
cp replit.md "$EXPORT_DIR/" 2>/dev/null || true

# Documentation files
echo "📚 Copying documentation..."
cp README.md "$EXPORT_DIR/" 2>/dev/null || true
cp DEPLOYMENT_GUIDE.md "$EXPORT_DIR/" 2>/dev/null || true
cp MIGRATION_PACKAGE.md "$EXPORT_DIR/" 2>/dev/null || true
cp SECURITY.md "$EXPORT_DIR/" 2>/dev/null || true
cp environment_variables.md "$EXPORT_DIR/" 2>/dev/null || true

# Source code directories
echo "💻 Copying source code..."

# Client source code
if [ -d "client" ]; then
    cp -r client "$EXPORT_DIR/"
    echo "  ✅ Client directory copied"
fi

# Server source code  
if [ -d "server" ]; then
    cp -r server "$EXPORT_DIR/"
    echo "  ✅ Server directory copied"
fi

# Shared source code
if [ -d "shared" ]; then
    cp -r shared "$EXPORT_DIR/"
    echo "  ✅ Shared directory copied"
fi

# Build and deployment files
echo "🔧 Copying build files..."
cp build.sh "$EXPORT_DIR/" 2>/dev/null || true
cp Dockerfile "$EXPORT_DIR/" 2>/dev/null || true

# Learning content files
echo "📖 Copying learning content..."
cp article.html "$EXPORT_DIR/" 2>/dev/null || true
cp article.txt "$EXPORT_DIR/" 2>/dev/null || true

# Essential assets (exclude screenshots and temporary files)
echo "🎨 Copying essential assets..."
if [ -d "attached_assets" ]; then
    mkdir -p "$EXPORT_DIR/attached_assets"
    # Copy only essential image assets (PNG files that aren't screenshots)
    find attached_assets -name "*.png" ! -name "Screenshot*" -exec cp {} "$EXPORT_DIR/attached_assets/" \; 2>/dev/null || true
    # Copy specific content files
    cp attached_assets/Bannerman.png "$EXPORT_DIR/attached_assets/" 2>/dev/null || true
    cp attached_assets/Parton.png "$EXPORT_DIR/attached_assets/" 2>/dev/null || true
    cp attached_assets/Whitaker.png "$EXPORT_DIR/attached_assets/" 2>/dev/null || true
    cp attached_assets/Witaker.png "$EXPORT_DIR/attached_assets/" 2>/dev/null || true
    echo "  ✅ Essential assets copied"
fi

# Create exclusion list for reference
echo "🚫 Creating exclusion reference..."
cat > "$EXPORT_DIR/EXPORT_EXCLUSIONS.md" << EOF
# Files Excluded from Export

This export excludes the following to keep the package clean and focused:

## Dependencies
- \`node_modules/\` - All NPM packages (install with \`npm install\`)
- \`dist/\` - Build outputs (regenerate with \`npm run build\`)

## Temporary/Generated Files
- \`.env\` files - Environment variables (create new ones)
- Log files and temporary files
- IDE/Editor specific files (.vscode, .idea, etc.)

## Asset Exclusions
- Screenshot files from \`attached_assets/\`
- Temporary text files with long names
- Development/debugging files

## Database
- Local database files
- Migration artifacts (recreate with \`npm run db:push\`)

## Sensitive Data
- API keys and credentials
- Local configuration overrides
EOF

# Create setup instructions
echo "📋 Creating setup instructions..."
cat > "$EXPORT_DIR/SETUP_INSTRUCTIONS.md" << EOF
# Project Setup Instructions

## Prerequisites
- Node.js 18+ 
- PostgreSQL database (local or cloud)
- NPM or similar package manager

## Installation Steps

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Setup**
   Create \`.env\` file with required variables:
   \`\`\`
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
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   npm run db:push
   \`\`\`

4. **Development**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Production Build**
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

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
See \`replit.md\` for complete architecture documentation.
EOF

# Generate file inventory
echo "📊 Generating file inventory..."
cat > "$EXPORT_DIR/FILE_INVENTORY.md" << EOF
# Project File Inventory

Generated on: $(date)

## Core Configuration
$(find "$EXPORT_DIR" -maxdepth 1 -name "*.json" -o -name "*.ts" -o -name "*.js" | sort)

## Source Code Structure
\`\`\`
$(find "$EXPORT_DIR" -type d | grep -E "(client|server|shared)" | sort)
\`\`\`

## Key Components
$(find "$EXPORT_DIR" -name "*.tsx" -o -name "*.ts" | grep -v node_modules | sort)

## Total Files: $(find "$EXPORT_DIR" -type f | wc -l)
## Total Size: $(du -sh "$EXPORT_DIR" | cut -f1)
EOF

# Create archive
echo "📦 Creating compressed archive..."
tar -czf "${EXPORT_DIR}.tar.gz" "$EXPORT_DIR"

# Generate summary
echo "✅ Export completed successfully!"
echo ""
echo "📁 Export Directory: $EXPORT_DIR"
echo "📦 Archive File: ${EXPORT_DIR}.tar.gz"
echo "📊 Files Exported: $(find "$EXPORT_DIR" -type f | wc -l)"
echo "💾 Total Size: $(du -sh "$EXPORT_DIR" | cut -f1)"
echo ""
echo "🚀 Ready for deployment or sharing!"
echo "📋 See SETUP_INSTRUCTIONS.md in the export for deployment guidance"