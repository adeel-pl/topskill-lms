/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use standalone in production builds (not in dev mode)
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
  // Rewrite /portal/* and /api/* to Django backend
  async rewrites() {
    // Get backend URL - use service name in Docker, or environment variable
    const backendUrl = process.env.BACKEND_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'http://backend:8000'  // Docker service name
        : 'http://localhost:8000');
    
    return [
      {
        source: '/portal/:path*',
        destination: `${backendUrl}/portal/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/admin/:path*',
        destination: `${backendUrl}/admin/:path*`,
      },
      {
        source: '/swagger/:path*',
        destination: `${backendUrl}/swagger/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Fix for react-player chunk loading issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
