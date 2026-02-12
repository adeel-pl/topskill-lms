This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Requirements

- **Node.js**: >= 18.17.0 (Recommended: Node 20)
- **npm**: Latest version

### Node Version Management

This project uses Node 20. If you're using `nvm`:

```bash
# Use the Node version specified in .nvmrc
nvm use

# Or install Node 20 if not available
nvm install 20
nvm use 20
```

The `.nvmrc` file specifies Node 20 for local development, matching production requirements.

**Note**: Next.js 14.2.5 requires Node.js >= 18.17.0. Using Node 20 ensures compatibility with both local development and production environments.

## Getting Started

### Option 1: Using the provided scripts (Recommended)

The project includes helper scripts that automatically use the correct Node.js version:

```bash
# Start development server
./start-dev.sh

# Build for production
./build.sh
```

### Option 2: Manual setup

First, ensure you're using the correct Node.js version:

```bash
# If using nvm (recommended)
nvm use

# Or manually switch to Node 20
nvm use 20
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Building for Production

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

The build process automatically detects the environment:
- **Local development**: Uses standard Next.js build
- **Production**: Uses standalone output for optimized Docker deployments

## Troubleshooting

### Node.js Version Issues

If you encounter errors like:
```
You are using Node.js X.X.X. For Next.js, Node.js version >= v18.17.0 is required.
```

**Solution**:
1. Install/use Node 20 (recommended):
   ```bash
   nvm install 20
   nvm use 20
   ```

2. Or use Node >= 18.17.0:
   ```bash
   nvm install 18.17.0
   nvm use 18.17.0
   ```

3. Verify your Node version:
   ```bash
   node --version
   ```

### Build Fails Locally but Works in Production

This usually happens when Node versions differ between local and production.

**Solution**: Ensure both environments use the same Node version:
- Local: Use `.nvmrc` file (`nvm use`)
- Production: Dockerfile uses Node 20 (already configured)

### Environment Variables

Make sure to set the required environment variables:

**Local (.env.local)**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

**Production (Docker)**:
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
BACKEND_URL=http://backend:8000
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
