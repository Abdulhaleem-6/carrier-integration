import { config } from './config/config.js';
import { UpsAuthManager } from './infrastructure/carriers/ups/ups.auth.js';
import { UpsCarrier } from './infrastructure/carriers/ups/ups.client.js';
import { ShippingService } from './services/shipping.service.js';

// 1. Initialize the UPS Auth logic
const upsAuth = new UpsAuthManager({
	clientId: config.UPS.CLIENT_ID,
	clientSecret: config.UPS.CLIENT_SECRET,
	baseUrl: config.UPS.BASE_URL,
});

// 2. Instantiate the UPS Carrier (Injecting the Auth Manager)
const upsCarrier = new UpsCarrier(upsAuth, config.UPS.BASE_URL);

// 3. Boot the main Shipping Service with our supported carriers
const shippingService = new ShippingService([upsCarrier]);

/**
 * in a real API or CLI, and we provide a small log to confirm boot.
 */
console.log('✅ Shipping Service initialized with carriers:', [
	upsCarrier.identifier,
]);

export { shippingService };
