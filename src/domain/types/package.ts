export interface Package {
	weight: number;
	weightUnit: 'LBS' | 'KGS';
	dimensions: {
		length: number;
		width: number;
		height: number;
		unit: 'IN' | 'CM';
	};
	[key: string]: any;
}
