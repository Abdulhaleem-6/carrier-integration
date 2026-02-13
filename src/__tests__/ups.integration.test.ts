import nock from 'nock';
import { UpsCarrier } from '../infrastructure/carriers/ups/ups.client.js';
import { UpsAuthManager } from '../infrastructure/carriers/ups/ups.auth.js';
import type { RateRequest } from '../domain/schemas/rate-request.schema.js';
import { CarrierError } from '../errors/carrier.error.js';

describe('UPS Integration Service', () => {
	const baseUrl = 'https://onlinetools.ups.com';
	let auth: UpsAuthManager;
	let carrier: UpsCarrier;

	beforeEach(() => {
		nock.cleanAll();

		auth = new UpsAuthManager({
			clientId: 'test-id',
			clientSecret: 'test-secret',
			baseUrl: baseUrl,
		});

		carrier = new UpsCarrier(auth, baseUrl);
	});

	const mockRequest: RateRequest = {
		origin: {
			city: 'New York',
			stateCode: 'NY',
			postalCode: '10001',
			countryCode: 'US',
		},
		destination: {
			city: 'Los Angeles',
			stateCode: 'CA',
			postalCode: '90001',
			countryCode: 'US',
		},
		packages: [
			{ weight: 10, dimensions: { length: 10, width: 10, height: 10 } },
		],
	};

	beforeEach(() => {
		nock.cleanAll();
	});

	it('should fetch rates successfully with valid auth', async () => {
		// 1. Mock OAuth Token Response
		nock(baseUrl)
			.post('/security/v1/oauth/token')
			.reply(200, { access_token: 'mock-token', expires_in: '3600' });

		// 2. Mock Rating API Response
		nock(baseUrl)
			.post('/rating/v1/shop')
			.reply(200, {
				RateResponse: {
					RatedShipment: [
						{
							Service: { Code: '03', Description: 'UPS Ground' },
							TotalCharges: { MonetaryValue: '15.50', CurrencyCode: 'USD' },
							GuaranteedDaysToDelivery: '3',
						},
					],
				},
			});

		const rates = await carrier.getRates(mockRequest);

		expect(rates).toHaveLength(1);
		expect(rates[0]?.totalAmount).toBe(15.5);
		expect(rates[0]?.serviceCode).toBe('03');
	});

	it('should retry once if the first call returns 401 (Token Expired)', async () => {
		// Force the first call to fail with 401, second with 200
		nock(baseUrl)
			.post('/security/v1/oauth/token')
			.reply(200, { access_token: 'old-token', expires_in: '3600' });
		nock(baseUrl).post('/rating/v1/shop').reply(401);

		// Recovery path
		nock(baseUrl)
			.post('/security/v1/oauth/token')
			.reply(200, { access_token: 'new-token', expires_in: '3600' });
		nock(baseUrl)
			.post('/rating/v1/shop')
			.reply(200, {
				RateResponse: {
					RatedShipment: {
						Service: { Code: '01' },
						TotalCharges: { MonetaryValue: '50.00', CurrencyCode: 'USD' },
					},
				},
			});

		const rates = await carrier.getRates(mockRequest);
		expect(rates[0]?.totalAmount).toBe(50.0);
	});

	it('should reuse cached token without fetching a new one', async () => {
		const tokenScope = nock(baseUrl)
			.post('/security/v1/oauth/token')
			.once()
			.reply(200, { access_token: 'cached-token', expires_in: '3600' });

		const rateScope = nock(baseUrl)
			.post('/rating/v1/shop')
			.twice()
			.reply(200, {
				RateResponse: {
					RatedShipment: {
						Service: { Code: '03' },
						TotalCharges: { MonetaryValue: '20.00', CurrencyCode: 'USD' },
					},
				},
			});

		await carrier.getRates(mockRequest);
		await carrier.getRates(mockRequest);

		expect(tokenScope.isDone()).toBe(true);
		expect(rateScope.isDone()).toBe(true);
	});

	it('should throw structured CarrierError on 500', async () => {
		nock(baseUrl)
			.post('/security/v1/oauth/token')
			.reply(200, { access_token: 'mock-token', expires_in: '3600' });

		nock(baseUrl)
			.post('/rating/v1/shop')
			.reply(500, { message: 'Internal Error' });

		await expect(carrier.getRates(mockRequest)).rejects.toBeInstanceOf(
			CarrierError,
		);
	});
});
