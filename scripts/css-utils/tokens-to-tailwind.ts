import slugify from 'slugify'

type MappableToken = { name: string; value: string | string[] }

function tokensToTailwind<T extends MappableToken>(
	tokens: T[],
): Record<string, string> {
	const nameSlug = (text: string) => slugify(text, { lower: true })
	const response: Record<string, string> = {}

	for (const token of tokens) {
		const key = nameSlug(token.name)
		if (key in response) {
			throw new Error(`Duplicate token slug detected: ${key}`)
		}
		if (Array.isArray(token.value)) {
			response[key] = token.value.join(', ')
		} else {
			response[key] = String(token.value)
		}
	}

	return response
}

export default tokensToTailwind
