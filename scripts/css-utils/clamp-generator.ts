import viewports from '@/design-tokens/viewports.json' with { type: 'json' }

interface Token {
	name: string
	min: number
	max: number
}

function clampGenerator(tokens: Token[], rootSize = 16) {
	return tokens.map(({ name, min, max }: Token) => {
		if (min === max) {
			return `${min / rootSize}rem`
		}

		// Convert the min and max sizes to rems
		const minSize = min / rootSize
		const maxSize = max / rootSize

		// Convert the pixel viewport sizes into rems
		const minViewport = viewports.min / rootSize
		const maxViewport = viewports.max / rootSize

		// Slope and intersection allow us to have a fluid value but also keep that sensible
		const slope = (maxSize - minSize) / (maxViewport - minViewport)
		const intersection = -1 * minViewport * slope + minSize

		return {
			name,
			value: `clamp(${minSize}rem, ${intersection.toFixed(2)}rem + ${(slope * 100).toFixed(2)}vw, ${maxSize}rem)`,
		}
	})
}

export default clampGenerator
