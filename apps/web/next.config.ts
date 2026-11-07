import type { NextConfig } from 'next';

// A same-origin gateway avoids third-party session cookies and browser CORS
// between separate *.vercel.app projects. The backend must still authorize its
// browser origins; never forward arbitrary user-supplied destination URLs.
const target = (process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/backend/api/v1/:path*', destination: `${target}/api/v1/:path*` }];
  },
};
export default nextConfig;
