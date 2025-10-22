export interface BaseToken {
	name: string
}

export interface ColorToken extends BaseToken {
	value: string
}

export interface FontToken extends BaseToken {
	description?: string
	value: string[]
}

export interface NumericToken extends BaseToken {
	value: number
}

export type WeightToken = NumericToken
export type LeadingToken = NumericToken

export interface RangeToken extends BaseToken {
	min: number
	max: number
}

export interface ClampResultToken extends BaseToken {
	value: string
}

export type DesignToken =
	| ColorToken
	| FontToken
	| WeightToken
	| LeadingToken
	| RangeToken
	| ClampResultToken

export interface TokenList<T> {
	items: T[]
}

export interface ViewportTokens {
	min: number
	mid: number
	max: number
}

export interface TokenDocument<T> {
	title?: string
	description?: string
	meta?: unknown
	items: T[]
}

export interface AllTokens {
	colors: TokenDocument<ColorToken>
	fonts: TokenDocument<FontToken>
	spacing: TokenDocument<RangeToken>
	leading: TokenDocument<LeadingToken>
	sizes: TokenDocument<RangeToken>
	weights: TokenDocument<WeightToken>
	viewports: ViewportTokens
}

export const DEFAULT_ROOT_SIZE = 16
