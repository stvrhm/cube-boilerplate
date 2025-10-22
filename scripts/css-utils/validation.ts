export type TokensDir = string
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { prettifyError, ZodError } from 'zod'
import type * as z from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function loadJson<T = unknown>(tokensDir: TokensDir, fileName: string): T {
	const filePath = join(tokensDir, fileName)
	return JSON.parse(readFileSync(filePath, 'utf8')) as T
}

function createTokenErrorMap(tokenType: string) {
	return (iss: z.ZodIssue) => {
		const field = String(iss.path?.[iss.path.length - 1])

		// Handle missing required fields
		if (
			iss.code === 'invalid_type' &&
			'received' in iss &&
			iss.received === 'undefined'
		) {
			if (tokenType === 'sizes' || tokenType === 'spacing') {
				return `Missing required property '${field}'. All ${tokenType} items must have both 'min' and 'max' properties.`
			}
			if (tokenType === 'colors' || tokenType === 'fonts') {
				return `Missing required property '${field}'. All ${tokenType} items must have a 'value' property.`
			}
			if (tokenType === 'leading' || tokenType === 'weights') {
				return `Missing required property '${field}'. All ${tokenType} items must have a 'value' property.`
			}
			return `Missing required property '${field}'.`
		}

		// Handle wrong types
		if (iss.code === 'invalid_type' && 'received' in iss) {
			if (field === 'min' || field === 'max') {
				return `Property '${field}' must be a number, received ${String(iss.received)}.`
			}
			if (field === 'value' && tokenType === 'colors') {
				return `Property 'value' must be a string (color value), received ${String(iss.received)}.`
			}
			if (field === 'value' && tokenType === 'fonts') {
				return `Property 'value' must be an array of strings (font family names), received ${String(iss.received)}.`
			}
			if (
				field === 'value' &&
				(tokenType === 'leading' || tokenType === 'weights')
			) {
				return `Property 'value' must be a number, received ${String(iss.received)}.`
			}
			if (field === 'name') {
				return `Property 'name' must be a string, received ${String(iss.received)}.`
			}
		}

		// Handle array validation for fonts
		if (
			iss.code === 'invalid_type' &&
			field === 'value' &&
			tokenType === 'fonts' &&
			'received' in iss
		) {
			return `Font family 'value' must be an array of strings, received ${String(iss.received)}.`
		}

		// Default fallback - return undefined to use default message
		return undefined
	}
}

function getItemContext(
	error: ZodError,
	tokensDir: TokensDir,
	fileName: string,
): string {
	try {
		const data = loadJson(tokensDir, fileName) as any
		const issues = error.issues

		if (issues.length === 0) return ''

		// Find the first issue that has an items array path
		const itemsIssue = issues.find(
			(issue) => issue.path.length >= 2 && issue.path[0] === 'items',
		)

		if (!itemsIssue || !Array.isArray(data.items)) return ''

		const itemIndex = itemsIssue.path[1]
		if (typeof itemIndex !== 'number' || itemIndex >= data.items.length)
			return ''

		const item = data.items[itemIndex]
		const itemName = item?.name ? ` (${item.name})` : ''

		return `\n\n  → at items[${itemIndex}]${itemName}\n\n  Current item:\n  ${JSON.stringify(item, null, 2)}\n\n  Fix: ${getFixSuggestion(itemsIssue, item)}`
	} catch {
		// If we can't extract context, just return empty string
		return ''
	}
}

function getFixSuggestion(issue: z.ZodIssue, item: any): string {
	const field = issue.path[issue.path.length - 1]

	if (
		issue.code === 'invalid_type' &&
		'received' in issue &&
		issue.received === 'undefined'
	) {
		if (field === 'max') {
			return `Add a 'max' property with a number value, e.g.:\n  {\n    "name": "${item.name || 'Item'}",\n    "min": ${item.min || 0},\n    "max": ${item.min ? item.min * 1.2 : 20}\n  }`
		}
		if (field === 'min') {
			return `Add a 'min' property with a number value, e.g.:\n  {\n    "name": "${item.name || 'Item'}",\n    "min": 16,\n    "max": ${item.max || 20}\n  }`
		}
		if (field === 'value') {
			if (Array.isArray(item.value)) {
				return `Add a 'value' property with a number value, e.g.:\n  {\n    "name": "${item.name || 'Item'}",\n    "value": 1.5\n  }`
			}
			return `Add a 'value' property with a string value, e.g.:\n  {\n    "name": "${item.name || 'Item'}",\n    "value": "#000000"\n  }`
		}
	}

	if (issue.code === 'invalid_type') {
		if (field === 'min' || field === 'max') {
			return `Change '${field}' to a number value, e.g.: ${field}: 16`
		}
		if (field === 'value') {
			return `Change 'value' to the correct type (string for colors, number for weights/leading, array for fonts)`
		}
	}

	return 'Check the schema requirements for this token type.'
}

export function getDefaultTokensDir(): string {
	return join(__dirname, '..', '..', 'src', 'design-tokens')
}

export function parseFile<S extends z.ZodTypeAny>(
	schema: S,
	tokensDir: TokensDir,
	fileName: string,
): z.infer<S> {
	try {
		// Determine token type from filename for better error messages
		const tokenType = fileName.replace('.json', '').replace('text-', '')

		return schema.parse(loadJson(tokensDir, fileName), {
			error: createTokenErrorMap(tokenType),
		} as Parameters<typeof schema.parse>[1])
	} catch (e) {
		if (e instanceof ZodError) {
			const pretty = prettifyError(e)

			// Extract item information for better context
			const itemContext = getItemContext(e, tokensDir, fileName)

			throw new Error(
				`Invalid token file: ${fileName}\n\n${pretty}${itemContext}`,
			)
		}
		throw e
	}
}
