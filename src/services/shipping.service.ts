import type { ICarrier } from '../domain/carrier.interface.js';
import { RateRequestSchema } from '../domain/schemas/rate-request.schema.js';
import type { RateQuote } from '../domain/types/rate-quote.js';

export class ShippingService {
	private carriers: Map<string, ICarrier> = new Map();

	constructor(initialCarriers: ICarrier[]) {
		initialCarriers.forEach((c) =>
			this.carriers.set(c.identifier.toLowerCase(), c),
		);
	}

	async getRates(
		carrierKey: string,
		rawRequest: unknown,
	): Promise<RateQuote[]> {
		const validation = RateRequestSchema.safeParse(rawRequest);
		if (!validation.success) {
			throw new Error(`Invalid request: ${validation.error.message}`);
		}

		const carrier = this.carriers.get(carrierKey.toLowerCase());
		if (!carrier) {
			throw new Error(`Carrier ${carrierKey} not supported.`);
		}

		return carrier.getRates(validation.data);
	}
}
