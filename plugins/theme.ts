import { resolve, sep } from 'node:path'
import invariant from 'tiny-invariant'
import { type Plugin, type ViteDevServer } from 'vite'
import { writeThemeToFile } from '../scripts/css-utils/create-theme'

export default function themePlugin(options: {
	tokensGlob: string
	outputPath: string
	outputDir: string
	outputFile: string
	tokensDir: string
}): Plugin {
	const tokensGlob = options.tokensGlob
	const outputPath = options.outputPath
	const outputDir = options.outputDir
	const outputFile = options.outputFile
	const tokensDir = options.tokensDir
	let root = ''

	return {
		name: 'theme-auto-generate',
		configResolved(config) {
			root = config.root
		},
		async buildStart() {
			invariant(tokensGlob, '💅 tokensGlob must be provided via vite config')
			const hasOutput = Boolean(outputPath || (outputDir && outputFile))
			invariant(
				hasOutput,
				'💅 provide outputPath OR both outputDir and outputFile',
			)
			const finalOutput = resolve(
				root,
				outputPath ?? resolve(outputDir!, outputFile!),
			)
			await writeThemeToFile({ outputPath: finalOutput, tokensDir })
		},
		configureServer(server: ViteDevServer) {
			invariant(tokensGlob, '💅 tokensGlob must be provided via vite config')
			const absGlob = resolve(root, tokensGlob)
			const tokensDirAbs = resolve(root, tokensDir)
			const finalOutput = resolve(
				root,
				outputPath ?? resolve(outputDir!, outputFile!),
			)

			// Add the tokens glob to watcher
			server.watcher.add(absGlob)

			let running = false
			let pending = false
			const trigger = async (filePath?: string) => {
				// Skip if the changed file is our output file
				if (filePath === finalOutput) return

				if (running) {
					pending = true
					return
				}
			running = true
			try {
				const result = await writeThemeToFile({
					outputPath: finalOutput,
					tokensDir,
				})
				if (result.written) {
					server.config.logger.info(
						`💅 theme.css regenerated from tokens → ${finalOutput}`,
					)
				} else {
					server.config.logger.info(
						`💅 theme.css generation skipped (no changes detected)`,
					)
				}
			} catch (e) {
					const errorMessage = e instanceof Error ? e.message : String(e)
					// Format multi-line errors properly for better readability
					const formattedError = errorMessage.includes('\n')
						? `💅 Theme generation failed:\n${errorMessage}`
						: `💅 Theme generation failed: ${errorMessage}`

					server.config.logger.error(formattedError)
				} finally {
					running = false
					if (pending) {
						pending = false
						void trigger().catch(() => {})
					}
				}
			}

			const shouldHandle = (filePath?: string) => {
				if (!filePath) return true
				// Only react to JSON files inside the tokens directory
				const inTokensDir = filePath.startsWith(tokensDirAbs + sep)
				const isJson = filePath.endsWith('.json')
				return inTokensDir && isJson
			}

			server.watcher
				.on('add', (filePath) => {
					if (shouldHandle(filePath)) void trigger(filePath).catch(() => {})
				})
				.on('change', (filePath) => {
					if (shouldHandle(filePath)) void trigger(filePath).catch(() => {})
				})
				.on('unlink', (filePath) => {
					if (shouldHandle(filePath)) void trigger(filePath).catch(() => {})
				})

			// Run once on dev server start
			void trigger().catch(() => {})
		},
	}
}
