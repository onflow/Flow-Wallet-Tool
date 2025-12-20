/** @type {import('next').NextConfig} */
import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
	reactStrictMode: true,
	// compiler: {
	//   removeConsole: process.env.NEXT_PUBLIC_ENV === "dev" ? false : true,
	// },
	async rewrites() {
		return [
			{
				source: '/_next/static/chunks/pages/:path*/wallet-core.wasm',
				destination: '/wallet-core.wasm',
			},
		];
	},
	turbopack: {
		root: __dirname,
		rules: {
			'*.wasm': {
				loaders: ['file-loader'],
			},
		},
	},
	webpack: (config, { isServer }) => {
	  config.plugins.push(
		new CopyPlugin({
		  patterns: [
			{
			  from: path.join(
				__dirname,
				"node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm",
			  ),
			  to: path.join(__dirname, "public/wallet-core.wasm"),
			},
		  ],
		}),
	  );
	  config.experiments.asyncWebAssembly = true;
	  config.resolve.fallback = { 
		fs: false,
		path: false,
		crypto: false,
		stream: false,
		assert: false,
		http: false,
		https: false,
		os: false,
		url: false
	  };
	  config.module.rules.push({
		test: /\.(wasm)$/,
		type: "asset/resource",
	  });
	  return config;
	},
  };
  

export default nextConfig;
