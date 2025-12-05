#!/bin/bash
# Start the Design Audit MCP server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Start the server
echo "Starting MCP server..."
npm start

