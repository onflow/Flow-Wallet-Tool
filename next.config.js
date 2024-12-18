/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle Node.js polyfills
    config.resolve.fallback = {
      fs: false,
      'fs/promises': false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      stream: false,
      util: false,
      buffer: false,
      process: false,
    };

    // Handle WASM
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // Add WASM file loader
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[hash][ext]'
      }
    });

    return config;
  },
}

module.exports = nextConfig; 