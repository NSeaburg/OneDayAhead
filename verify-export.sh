#!/bin/bash

# Export Verification Script
# Verifies that the exported project contains all essential files

EXPORT_DIR=$(ls -1d project-export-* | head -1)

if [ -z "$EXPORT_DIR" ]; then
    echo "❌ No export directory found!"
    exit 1
fi

echo "🔍 Verifying export: $EXPORT_DIR"
echo ""

# Check core files
echo "📋 Checking core configuration files..."
check_file() {
    if [ -f "$EXPORT_DIR/$1" ]; then
        echo "  ✅ $1"
    else
        echo "  ❌ $1 - MISSING"
    fi
}

check_file "package.json"
check_file "tsconfig.json"
check_file "vite.config.ts"
check_file "tailwind.config.ts"
check_file "drizzle.config.ts"
check_file "replit.md"

echo ""
echo "📁 Checking source directories..."
check_dir() {
    if [ -d "$EXPORT_DIR/$1" ]; then
        FILE_COUNT=$(find "$EXPORT_DIR/$1" -name "*.ts" -o -name "*.tsx" | wc -l)
        echo "  ✅ $1 ($FILE_COUNT TypeScript files)"
    else
        echo "  ❌ $1 - MISSING"
    fi
}

check_dir "client/src"
check_dir "server"
check_dir "shared"

echo ""
echo "🎨 Checking assets..."
if [ -d "$EXPORT_DIR/attached_assets" ]; then
    ASSET_COUNT=$(find "$EXPORT_DIR/attached_assets" -name "*.png" | wc -l)
    echo "  ✅ attached_assets ($ASSET_COUNT PNG files)"
else
    echo "  ❌ attached_assets - MISSING"
fi

echo ""
echo "📚 Checking documentation..."
check_file "SETUP_INSTRUCTIONS.md"
check_file "EXPORT_EXCLUSIONS.md"
check_file "FILE_INVENTORY.md"
check_file "DEPLOYMENT_GUIDE.md"

echo ""
echo "📊 Export Summary:"
echo "  Total files: $(find "$EXPORT_DIR" -type f | wc -l)"
echo "  TypeScript files: $(find "$EXPORT_DIR" -name "*.ts" -o -name "*.tsx" | wc -l)"
echo "  React components: $(find "$EXPORT_DIR" -name "*.tsx" | wc -l)"
echo "  Size: $(du -sh "$EXPORT_DIR" | cut -f1)"
echo ""

# Check if archive exists
if [ -f "${EXPORT_DIR}.tar.gz" ]; then
    echo "📦 Archive: ${EXPORT_DIR}.tar.gz ($(du -sh "${EXPORT_DIR}.tar.gz" | cut -f1))"
else
    echo "❌ Archive not found"
fi

echo "✅ Verification complete!"