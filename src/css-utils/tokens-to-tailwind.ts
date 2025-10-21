import slugify from "slugify"

function tokensToTailwind(tokens) {
	const nameSlug = (text: string) => slugify(text, { lower: true })
	const response = {}

	tokens.forEach(({ name, value }) => {
		response[nameSlug(name)] = value
	})

	return response
}

export default tokensToTailwind
