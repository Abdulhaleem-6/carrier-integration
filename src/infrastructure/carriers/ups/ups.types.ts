export interface UpsRateResponse {
	RateResponse: {
		RatedShipment: UpsRatedShipment | UpsRatedShipment[];
	};
}

export interface UpsRatedShipment {
	Service: {
		Code: string;
		Description?: string;
	};
	TotalCharges: {
		CurrencyCode: string;
		MonetaryValue: string;
	};
	GuaranteedDaysToDelivery?: string;
}
