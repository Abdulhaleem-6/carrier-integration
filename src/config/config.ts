import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'test', 'production'])
		.default('development'),
	UPS: z.object({
		CLIENT_ID: z.string().min(1, 'UPS_CLIENT_ID is required'),
		CLIENT_SECRET: z.string().min(1, 'UPS_CLIENT_SECRET is required'),
		BASE_URL: z.string().url().default('https://wwwcie.ups.com'),
	}),
});

// Validate process.env against the schema
const _config = configSchema.safeParse({
	NODE_ENV: process.env.NODE_ENV,
	UPS: {
		CLIENT_ID: process.env.UPS_CLIENT_ID,
		CLIENT_SECRET: process.env.UPS_CLIENT_SECRET,
		BASE_URL: process.env.UPS_BASE_URL,
	},
});

if (!_config.success) {
	console.error('❌ Invalid environment variables:', _config.error.format());
	process.exit(1);
}

export const config = _config.data;
