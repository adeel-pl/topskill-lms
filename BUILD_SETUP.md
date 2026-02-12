# Build Setup - Local and Production

## ✅ Production Build (Docker)

Production builds are **already configured** and work correctly:

- **Dockerfile**: Uses `node:20-alpine` (Node 20)
- **Dockerfile.dev**: Uses `node:20-alpine` (Node 20)
- **docker-compose.prod.yml**: Configured for production
- **next.config.js**: Automatically uses standalone output in production

### Building for Production

```bash
# Using Docker (Recommended)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up frontend

# Or using Dockerfile directly
cd frontend
docker build -t topskill-frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id \
  --build-arg NODE_ENV=production \
  --build-arg BACKEND_URL=http://backend:8000 \
  .
```

## 🔧 Local Development Build

### Requirements

- **Node.js**: >= 18.17.0 (Required: Node 20 recommended)
- **npm**: Latest version

### Setup Node.js Version

#### Option 1: Using nvm (Recommended)

```bash
# Install Node 20 if not already installed
nvm install 20

# Use Node 20 for this project
cd frontend
nvm use

# Verify Node version
node --version  # Should show v20.x.x
```

#### Option 2: Using the provided scripts

The project includes helper scripts that attempt to use the correct Node version:

```bash
cd frontend

# Start development server
./start-dev.sh

# Build for production
./build.sh
```

**Note**: These scripts require nvm to be properly configured in your shell.

### Manual Build

If you have Node 20 properly set up:

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Or start development server
npm run dev
```

## 📋 Version Configuration

The project is configured with:

- **`.nvmrc`**: Specifies Node 20 for local development
- **`package.json`**: `engines.node >= 18.17.0` requirement
- **Dockerfiles**: Use Node 20 for consistency

## 🐛 Troubleshooting

### "Node.js version X.X.X is below required version 18.17.0"

**Solution**:
1. Install Node 20 using nvm:
   ```bash
   nvm install 20
   nvm use 20
   ```

2. Verify your Node version:
   ```bash
   node --version
   ```

3. If using nvm, ensure it's loaded in your shell:
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

### Build works locally but fails in production

This should not happen as both use Node 20:
- **Local**: Use `.nvmrc` file (`nvm use`)
- **Production**: Dockerfile uses Node 20

### PATH conflicts with other Node installations

If you have multiple Node installations (e.g., system Node, nvm Node), ensure nvm's Node is first in PATH:

```bash
# Check which Node is being used
which node

# Should point to nvm's Node, e.g.:
# /home/user/.nvm/versions/node/v20.20.0/bin/node
```

## ✅ Verification

To verify everything is set up correctly:

```bash
cd frontend

# Check Node version
node --version  # Should be v20.x.x or >= v18.17.0

# Check npm version
npm --version

# Try building
npm run build
```

## 🚀 Summary

- **Production**: ✅ Already configured with Node 20 in Docker
- **Local**: Use Node 20 via nvm (`.nvmrc` file provided)
- **Both environments**: Now use the same Node version (20) for consistency

The commit `2595e2353082bb6acb6faff71e82476e1281a743` ensures:
- Local and production use the same Node version
- `.nvmrc` file for easy local setup
- `engines` field in package.json for version requirements
- Documentation for troubleshooting

