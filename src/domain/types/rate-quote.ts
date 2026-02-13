export interface RateQuote {
	carrier: string;
	serviceName: string;
	serviceCode: string;
	totalAmount: number;
	currency: string;
	guaranteedDays?: number | undefined;
	estimatedDeliveryDate?: string;
	[key: string]: any;
}
