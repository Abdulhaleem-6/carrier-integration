export interface Address {
	name?: string;
	addressLine1: string;
	addressLine2?: string;
	city: string;
	stateCode: string;
	postalCode: string;
	countryCode: string;
	[key: string]: any;
}
