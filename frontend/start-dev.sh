#!/bin/bash
# Development server script that ensures correct Node.js version

set -e

# Load nvm if available
export NVM_DIR="$HOME/.nvm"
NODE_BIN=""
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  
  # Use Node version from .nvmrc
  if [ -f .nvmrc ]; then
    nvm use > /dev/null 2>&1
  else
    nvm use 20 > /dev/null 2>&1
  fi
  
  # Get the path to nvm's node directly
  NVM_CURRENT=$(nvm current)
  NODE_BIN="$NVM_DIR/versions/node/$NVM_CURRENT/bin/node"
  
  # Ensure nvm's node is in PATH first
  export PATH="$NVM_DIR/versions/node/$NVM_CURRENT/bin:$PATH"
fi

# Fallback to system node if nvm not available
if [ -z "$NODE_BIN" ] || [ ! -f "$NODE_BIN" ]; then
  NODE_BIN=$(which node)
fi

# Verify Node version
NODE_VERSION=$($NODE_BIN --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
NODE_MINOR=$(echo $NODE_VERSION | cut -d'.' -f2)
NODE_MAJOR_MINOR="$NODE_MAJOR.$NODE_MINOR"
REQUIRED_VERSION="18.17"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_MAJOR_MINOR" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
  echo "Error: Node.js version $NODE_VERSION is below required version $REQUIRED_VERSION"
  echo "Please use Node.js >= 18.17.0 (recommended: Node 20)"
  echo ""
  echo "If using nvm:"
  echo "  nvm install 20"
  echo "  nvm use 20"
  exit 1
fi

echo "Using Node.js $($NODE_BIN --version) from $NODE_BIN"
echo "Starting development server..."

# Run the dev server - npm will use the Node from PATH
npm run dev
