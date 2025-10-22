import { z } from 'zod'

const namedValueSchema = z.object({ name: z.string(), value: z.string() })
const namedStringArraySchema = z.object({
	name: z.string(),
	value: z.array(z.string()),
})
const rangeSchema = z.object({
	name: z.string(),
	min: z.number(),
	max: z.number(),
})
const numberValueSchema = z.object({ name: z.string(), value: z.number() })

const tokenDocument = <T extends z.ZodTypeAny>(schema: T) =>
	z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		meta: z.unknown().optional(),
		items: z.array(schema),
	})

const viewportsSchema = z.object({
	min: z.number(),
	mid: z.number(),
	max: z.number(),
})

const colorsDocSchema = tokenDocument(namedValueSchema)
const fontsDocSchema = tokenDocument(namedStringArraySchema)
const spacingDocSchema = tokenDocument(rangeSchema)
const leadingDocSchema = tokenDocument(numberValueSchema)
const sizesDocSchema = tokenDocument(rangeSchema)
const weightsDocSchema = tokenDocument(numberValueSchema)

export const TokenSchema = {
	Colors: colorsDocSchema,
	Fonts: fontsDocSchema,
	Spacing: spacingDocSchema,
	Leading: leadingDocSchema,
	Sizes: sizesDocSchema,
	Weights: weightsDocSchema,
	Viewports: viewportsSchema,
} as const
