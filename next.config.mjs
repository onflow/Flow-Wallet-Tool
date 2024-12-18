/** @type {import('next').NextConfig} */
import { cp } from "node:fs/promises";

const nextConfig = {
	async rewrites() {
		// Copy wallet-core files to public directory during build
		await cp(
			"node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm",
			"public/wallet-core.wasm",
			{
				recursive: true,
			}
		);
		return [];
	},
	webpack: (config, { isServer }) => {
		// Handle Node.js polyfills
		config.resolve.fallback = {
			fs: false,
			"fs/promises": false,
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
			...config.experiments,
			asyncWebAssembly: true,
			layers: true,
		};

		// Add WASM file loader
		config.module.rules.push({
			test: /wallet-core.wasm$/,
			type: "asset/resource",
			generator: {
				filename: "vendor-chunks/wallet-core.wasm",
			},
		});

		return config;
	},
};

export default nextConfig;
