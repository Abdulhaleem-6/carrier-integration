import { AppError } from './app.error.js';

export class CarrierError extends AppError {
	constructor(
		public readonly carrier: string,
		message: string,
		statusCode: number,
		public readonly rawDetails?: unknown,
	) {
		super(`[${carrier}] ${message}`, statusCode);
	}
}
