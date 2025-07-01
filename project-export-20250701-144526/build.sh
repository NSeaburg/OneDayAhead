#!/bin/bash

echo "Building client-side code..."
npx vite build

echo "Building server-side code..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Copying public files..."
if [ ! -d "dist/public" ]; then
  mkdir -p dist/public
fi
cp -r public/* dist/public/

echo "Build completed! Check the dist/ directory."