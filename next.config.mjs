/** @type {import('next').NextConfig} */
import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
	reactStrictMode: true,
	publicRuntimeConfig: {
	  basePath: "",
	},
	// compiler: {
	//   removeConsole: process.env.NEXT_PUBLIC_ENV === "dev" ? false : true,
	// },
	webpack: (config, { isServer }) => {
	  config.plugins.push(
		new CopyPlugin({
		  patterns: [
			{
			  from: path.join(
				__dirname,
				"node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm",
			  ),
			  to: path.join(__dirname, ".next/static/chunks/pages/key"),
			},
		  ],
		}),
	  );
	  config.experiments.asyncWebAssembly = true;
	  if (!isServer) {
		config.output.publicPath = `/_next/`;
	  } else {
		config.output.publicPath = `./`;
	  }
	  config.resolve.fallback = { fs: false };
	  config.output.assetModuleFilename = `node_modules/@trustwallet/dist/lib/wallet-core.wasm`;
	  config.module.rules.push({
		test: /\.(wasm)$/,
		type: "asset/resource",
	  });
	  return config;
	},
  };
  

export default nextConfig;
