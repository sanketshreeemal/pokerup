/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration for better stability
  webpack: (config, { dev, isServer }) => {
    // Optimize chunk splitting for better stability
    if (dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Improve module resolution
    config.resolve.symlinks = false;
    
    return config;
  },

  // Experimental features for better stability
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@radix-ui/react-dialog', '@radix-ui/react-toast', 'lucide-react'],
  },

  // Compiler options for better tree shaking
  compiler: {
    removeConsole: false, // Keep console logs in development
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "www.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      }
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
