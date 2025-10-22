import slugify from 'slugify'

interface BaseToken {
	name: string
}

interface ColorToken extends BaseToken {
	value: string
}

interface FontToken extends BaseToken {
	description?: string
	value: string[]
}

interface SpacingToken extends BaseToken {
	min: number
	max: number
}

interface WeightToken extends BaseToken {
	value: number
}

type Token = ColorToken | FontToken | SpacingToken | WeightToken | string

function tokensToTailwind(tokens: Token[]): Record<string, string> {
	const nameSlug = (text: string) => slugify(text, { lower: true })
	const response: Record<string, string> = {}

	tokens.forEach((token) => {
		if (typeof token === 'string') {
			response[nameSlug(token)] = token
		} else if ('value' in token) {
			if (Array.isArray(token.value)) {
				// Font tokens have array values
				response[nameSlug(token.name)] = token.value.join(', ')
			} else {
				response[nameSlug(token.name)] = String(token.value)
			}
		} else if ('min' in token && 'max' in token) {
			// Spacing tokens - this will be handled by clampGenerator
			response[nameSlug(token.name)] = `${token.min}px`
		}
	})

	return response
}

export default tokensToTailwind
