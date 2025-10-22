import {
	type RangeToken,
	type ClampResultToken,
	type ViewportTokens,
	DEFAULT_ROOT_SIZE,
} from './types'

function clampGenerator(
	tokens: RangeToken[],
	viewport: ViewportTokens,
	rootSize = DEFAULT_ROOT_SIZE,
) {
	return tokens.map(({ name, min, max }: RangeToken): ClampResultToken => {
		if (min === max) {
			return { name, value: `${min / rootSize}rem` }
		}

		// Convert the min and max sizes to rems
		const minSize = min / rootSize
		const maxSize = max / rootSize

		// Convert the pixel viewport sizes into rems
		const minViewport = viewport.min / rootSize
		const maxViewport = viewport.max / rootSize

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
