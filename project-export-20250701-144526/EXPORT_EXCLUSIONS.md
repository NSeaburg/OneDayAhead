# Files Excluded from Export

This export excludes the following to keep the package clean and focused:

## Dependencies
- `node_modules/` - All NPM packages (install with `npm install`)
- `dist/` - Build outputs (regenerate with `npm run build`)

## Temporary/Generated Files
- `.env` files - Environment variables (create new ones)
- Log files and temporary files
- IDE/Editor specific files (.vscode, .idea, etc.)

## Asset Exclusions
- Screenshot files from `attached_assets/`
- Temporary text files with long names
- Development/debugging files

## Database
- Local database files
- Migration artifacts (recreate with `npm run db:push`)

## Sensitive Data
- API keys and credentials
- Local configuration overrides
