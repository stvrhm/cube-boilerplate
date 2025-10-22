import { resolve } from 'node:path'
import { env } from 'node:process'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import themePlugin from './plugins/theme'

export default defineConfig({
	plugins: [
		tailwindcss(),
		themePlugin({
			tokensGlob: 'src/design-tokens/**/*.json',
			outputPath: 'src/css/theme.css',
			outputDir: 'src/css',
			outputFile: 'theme.css',
			tokensDir: 'src/design-tokens',
		}),
	],
	// Use BASE_PATH for GitHub Pages subpath (e.g., "/<repo>/"); defaults to "/" locally
	base: env.BASE_PATH || '/',
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'@/design-tokens': resolve(__dirname, './src/design-tokens'),
			'@/css': resolve(__dirname, './src/css'),
			'@/scripts': resolve(__dirname, './scripts'),
		},
	},
	build: {
		rollupOptions: {
			input: {
				main: 'index.html',
				utilities: 'utilities.html',
				blocks: 'blocks.html',
				compositions: 'compositions.html',
				theme: 'theme.html',
			},
		},
	},
})
