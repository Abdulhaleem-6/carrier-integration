import type { RateRequest } from './schemas/rate-request.schema.js';
import type { RateQuote } from './types/rate-quote.js';

export interface ICarrier {
	readonly identifier: string;
	getRates(request: RateRequest): Promise<RateQuote[]>;

	// Future:
	// purchaseLabel?(...)
	// trackShipment?(...)
}
