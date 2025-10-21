import { env } from "node:process"

import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
	plugins: [tailwindcss()],
	// Use BASE_PATH for GitHub Pages subpath (e.g., "/<repo>/"); defaults to "/" locally
	base: env.BASE_PATH || "/",
	build: {
		rollupOptions: {
			input: {
				main: "index.html",
				utilities: "utilities.html",
				blocks: "blocks.html",
				compositions: "compositions.html",
				theme: "theme.html",
			},
		},
	},
})
