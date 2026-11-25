import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
	server: {
		host: "127.0.0.1",
		port: Number(process.env.PORT || 3000),
		strictPort: true,
	},
	resolve: { tsconfigPaths: true },
	plugins: [
		tailwindcss(),
		tanstackStart(),
		nitro({
			preset:
				command === "build"
					? (process.env.NITRO_PRESET ?? "vercel")
					: "nitro-dev",
		}),
		viteReact(),
	],
}));
