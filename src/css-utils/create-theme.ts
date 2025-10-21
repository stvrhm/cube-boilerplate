import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import colorTokens from "../design-tokens/colors.json" with { type: "json" }
import fontTokens from "../design-tokens/fonts.json" with { type: "json" }
import spacingTokens from "../design-tokens/spacing.json" with { type: "json" }
import textLeadingTokens from "../design-tokens/text-leading.json" with { type: "json" }
import textSizeTokens from "../design-tokens/text-sizes.json" with { type: "json" }
import textWeightTokens from "../design-tokens/text-weights.json" with { type: "json" }
import viewportTokens from "../design-tokens/viewports.json" with { type: "json" }
import clampGenerator from "./clamp-generator.ts"
import tokensToTailwind from "./tokens-to-tailwind.ts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function createTheme(rootSize = 16) {
	const spacing = tokensToTailwind(clampGenerator(spacingTokens.items))
	const colors = tokensToTailwind(colorTokens.items)
	const fontFamily = tokensToTailwind(fontTokens.items)
	const fontWeight = tokensToTailwind(textWeightTokens.items)
	const fontSize = tokensToTailwind(clampGenerator(textSizeTokens.items))
	const lineHeight = tokensToTailwind(textLeadingTokens.items)

	// Helper function to convert token objects to CSS custom properties
	// https://tailwindcss.com/docs/theme#theme-variable-namespaces
	const formatTokens = (tokens, prefix) => {
		return Object.entries(tokens)
			.map(([key, value]) => `\t\t--${prefix}-${key}: ${value};`)
			.join("\n")
	}

	return `@theme {
--breakpoint-sm: ${viewportTokens.min / rootSize}rem;
--breakpoint-md: ${viewportTokens.mid / rootSize}rem;
--breakpoint-lg: ${viewportTokens.max / rootSize}rem;
${formatTokens(spacing, "spacing")}
--spacing-0: 0;
--spacing-auto: auto;
--spacing-full: 100%;
${formatTokens(colors, "color")}
${formatTokens(fontFamily, "font")}
${formatTokens(fontWeight, "font-weight")}
${formatTokens(fontSize, "text")}
${formatTokens(lineHeight, "leading")}
	}`
}

function writeThemeToFile(outputPath = "theme.css") {
	const themeContent = createTheme()
	const fullPath = join(__dirname, "..", "..", outputPath)

	try {
		writeFileSync(fullPath, themeContent, "utf8")
	} catch (error) {
		throw new Error(`Failed to write theme file: ${error}`)
	}
}

// CLI execution when run directly
function handleCLI() {
	const args = process.argv.slice(2)
	let outputPath = "theme.css"

	// Parse command line arguments
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--output" || args[i] === "-o") {
			if (i + 1 < args.length) {
				outputPath = args[i + 1]
				i++ // Skip next argument as it's the value
			} else {
				// biome-ignore lint/suspicious/noConsole: CLI output is necessary
				console.error("Error: --output flag requires a path value")
				process.exit(1)
			}
		} else if (args[i] === "--help" || args[i] === "-h") {
			// biome-ignore lint/suspicious/noConsole: CLI output is necessary
			console.log(`
Usage: npm run theme [options]

Options:
  --output, -o <path>    Output path for the theme file (default: theme.css)
  --help, -h             Show this help message

Examples:
  npm run theme                           # Creates theme.css in project root
  npm run theme -- --output dist/theme.css  # Creates theme file in dist folder
`)
			process.exit(0)
		} else if (!args[i].startsWith("-")) {
			// If it's not a flag, treat it as output path for backward compatibility
			outputPath = args[i]
		}
	}

	try {
		writeThemeToFile(outputPath)
		// biome-ignore lint/suspicious/noConsole: CLI output is necessary
		console.log(`✅ Theme file created successfully at: ${outputPath}`)
	} catch (error) {
		// biome-ignore lint/suspicious/noConsole: CLI output is necessary
		console.error(`❌ Failed to create theme file: ${error.message}`)
		process.exit(1)
	}
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
	handleCLI()
}

// Export the write function for external use
export { writeThemeToFile }

export default createTheme
