import { z } from 'zod';

export const RateRequestSchema = z.object({
	origin: z.object({
		city: z.string(),
		stateCode: z.string().length(2),
		postalCode: z.string(),
		countryCode: z.string().length(2),
	}),
	destination: z.object({
		city: z.string(),
		stateCode: z.string().length(2),
		postalCode: z.string(),
		countryCode: z.string().length(2),
	}),
	packages: z
		.array(
			z.object({
				weight: z.number().positive(),
				dimensions: z.object({
					length: z.number().positive(),
					width: z.number().positive(),
					height: z.number().positive(),
				}),
			}),
		)
		.min(1),
	serviceLevel: z.string().optional(),
});

export type RateRequest = z.infer<typeof RateRequestSchema>;
