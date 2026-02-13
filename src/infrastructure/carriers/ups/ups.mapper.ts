import type { RateRequest } from '../../../domain/schemas/rate-request.schema.js';
import type { RateQuote } from '../../../domain/types/rate-quote.js';
import type { UpsRatedShipment, UpsRateResponse } from './ups.types.js';

export class UpsMapper {
	static toUpsRequest(request: RateRequest) {
		return {
			RateRequest: {
				Request: { RequestOption: 'Shop' },
				Shipment: {
					Shipper: {
						Address: {
							City: request.origin.city,
							StateProvinceCode: request.origin.stateCode,
							PostalCode: request.origin.postalCode,
							CountryCode: request.origin.countryCode,
						},
					},
					ShipTo: {
						Address: {
							City: request.destination.city,
							StateProvinceCode: request.destination.stateCode,
							PostalCode: request.destination.postalCode,
							CountryCode: request.destination.countryCode,
						},
					},
					Package: request.packages.map((p) => ({
						PackagingType: { Code: '02' },
						Dimensions: {
							UnitOfMeasurement: { Code: 'IN' },
							Length: p.dimensions.length.toString(),
							Width: p.dimensions.width.toString(),
							Height: p.dimensions.height.toString(),
						},
						PackageWeight: {
							UnitOfMeasurement: { Code: 'LBS' },
							Weight: p.weight.toString(),
						},
					})),
				},
			},
		};
	}

	static toDomainQuotes(upsResponse: UpsRateResponse): RateQuote[] {
		const shipments = upsResponse.RateResponse?.RatedShipment || [];

		const results: UpsRatedShipment[] = Array.isArray(shipments)
			? shipments
			: [shipments];

		return results.map(
			(s: UpsRatedShipment): RateQuote => ({
				carrier: 'UPS',
				serviceName: s.Service.Description || s.Service.Code,
				serviceCode: s.Service.Code,
				totalAmount: parseFloat(s.TotalCharges.MonetaryValue),
				currency: s.TotalCharges.CurrencyCode,
				guaranteedDays: s.GuaranteedDaysToDelivery
					? parseInt(s.GuaranteedDaysToDelivery, 10)
					: undefined,
			}),
		);
	}
}
