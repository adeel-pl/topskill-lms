# 🐳 Docker Production Setup Guide

## Overview

This project uses Docker Compose with environment-based configuration for different deployment environments:
- **Production**: `https://topskill-lms.server3.purelogics.net/`
- **Staging**: (configurable)
- **Local Development**: `http://localhost:3000`

---

## 🚀 Quick Start

### Production Deployment

```bash
# Build and start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

### Local Development

```bash
# Build and start local development services
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d --build

# View logs
docker-compose -f docker-compose.yml -f docker-compose.local.yml logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.local.yml down
```

---

## 📋 Configuration Files

### `docker-compose.yml` (Base Configuration)
- Base configuration for all environments
- Contains database, backend, and frontend services
- Uses environment variables for flexibility

### `docker-compose.prod.yml` (Production Override)
- Production-specific settings
- Uses production API URL: `https://topskill-lms.server3.purelogics.net/api`
- Sets `NODE_ENV=production`
- Removes development volumes for better performance
- Sets `DEBUG=False` for backend

### `docker-compose.local.yml` (Local Development Override)
- Local development settings
- Uses localhost API URL: `http://localhost:8000/api`
- Sets `NODE_ENV=development`
- Uses `npm run dev` for hot-reload development

---

## 🔧 Frontend Build Process

### Production Build

The frontend uses a **multi-stage Docker build** with `npm run build`:

1. **Dependencies Stage**: Installs npm packages
2. **Builder Stage**: 
   - Receives build arguments (`NEXT_PUBLIC_API_URL`, `NODE_ENV`)
   - Runs `npm run build` with production configuration
   - Embeds environment variables at build time
3. **Runner Stage**: 
   - Creates optimized production image
   - Uses standalone output (if available) or regular build
   - Runs as non-root user for security

### Build Arguments

```yaml
build:
  args:
    - NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
    - NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
    - NODE_ENV=production
```

**Important**: Next.js embeds `NEXT_PUBLIC_*` variables at **build time**, not runtime. You must rebuild after changing these values.

---

## 🌍 Environment Variables

### Production Environment Variables

Set these in `docker-compose.prod.yml` or via environment:

```bash
NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
NODE_ENV=production
DEBUG=False
```

### Local Development Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
NODE_ENV=development
DEBUG=True
```

---

## 🔄 Rebuilding After Changes

### When to Rebuild

You **must rebuild** the frontend container when:
- ✅ Changing `NEXT_PUBLIC_*` environment variables
- ✅ Updating frontend code
- ✅ Changing `next.config.js`
- ✅ Updating dependencies (`package.json`)

### Rebuild Commands

```bash
# Rebuild only frontend
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build frontend

# Rebuild and restart
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build frontend

# Force rebuild (no cache)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache frontend
```

---

## 🐛 Troubleshooting

### Frontend Still Using Localhost URL

**Problem**: Frontend calls `localhost:8000` instead of production URL.

**Solution**:
1. Verify build args in `docker-compose.prod.yml`
2. Rebuild frontend: `docker-compose build --no-cache frontend`
3. Restart: `docker-compose up -d frontend`
4. Check browser console for actual API URL

### Build Fails

**Problem**: `npm run build` fails during Docker build.

**Solution**:
1. Check build logs: `docker-compose build frontend`
2. Verify `next.config.js` is valid
3. Check for TypeScript/ESLint errors
4. Ensure all dependencies are in `package.json`

### Environment Variables Not Working

**Problem**: Environment variables not taking effect.

**Solution**:
1. Remember: `NEXT_PUBLIC_*` variables are embedded at **build time**
2. Must rebuild after changing them
3. Check build args are passed correctly
4. Verify `next.config.js` handles env vars

### Port Conflicts

**Problem**: Ports already in use.

**Solution**:
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

---

## 📊 Service Health Checks

All services include health checks:

- **Database**: Checks PostgreSQL readiness
- **Backend**: Checks API endpoint availability
- **Frontend**: Checks web server availability

View health status:
```bash
docker-compose ps
```

---

## 🔒 Security Best Practices

1. **Non-root User**: Frontend runs as `nextjs` user (UID 1001)
2. **Production Mode**: `DEBUG=False` in production
3. **Environment Variables**: Sensitive data via env vars, not hardcoded
4. **No Volumes in Production**: Production override removes development volumes

---

## 📝 File Structure

```
.
├── docker-compose.yml          # Base configuration
├── docker-compose.prod.yml      # Production override
├── docker-compose.local.yml     # Local development override
├── frontend/
│   ├── Dockerfile              # Multi-stage production build
│   └── next.config.js          # Next.js config with standalone output
└── backend/
    └── Dockerfile              # Backend Dockerfile
```

---

## 🎯 Production Deployment Checklist

- [ ] Update `docker-compose.prod.yml` with correct production URL
- [ ] Set `NODE_ENV=production` in build args
- [ ] Set `DEBUG=False` for backend
- [ ] Rebuild frontend: `docker-compose build --no-cache frontend`
- [ ] Start services: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
- [ ] Verify health checks: `docker-compose ps`
- [ ] Check logs: `docker-compose logs -f frontend`
- [ ] Test API calls in browser console
- [ ] Verify courses load on homepage

---

## 🚀 Quick Commands Reference

```bash
# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart frontend

# Local
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
docker-compose -f docker-compose.yml -f docker-compose.local.yml logs -f

# Rebuild only frontend
docker-compose build --no-cache frontend

# View all services
docker-compose ps

# Stop all
docker-compose down
```

---

## 📞 Support

If you encounter issues:
1. Check service logs: `docker-compose logs [service-name]`
2. Verify environment variables are set correctly
3. Ensure ports are not in use
4. Check Docker daemon is running: `docker ps`

