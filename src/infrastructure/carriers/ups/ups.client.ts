import axios, { type AxiosInstance, AxiosError } from 'axios';

import { CarrierError } from '../../../errors/carrier.error.js';
import { UpsAuthManager } from './ups.auth.js';
import { UpsMapper } from './ups.mapper.js';
import type { ICarrier } from '../../../domain/carrier.interface.js';
import type { RateRequest } from '../../../domain/schemas/rate-request.schema.js';
import type { RateQuote } from '../../../domain/types/rate-quote.js';
import type { UpsRateResponse } from './ups.types.js';

export class UpsCarrier implements ICarrier {
	public readonly identifier = 'UPS';
	private readonly http: AxiosInstance;

	constructor(
		private readonly auth: UpsAuthManager,
		private readonly baseUrl: string,
	) {
		this.http = axios.create({
			baseURL: this.baseUrl,
			timeout: 10000,
		});
	}

	async getRates(request: RateRequest): Promise<RateQuote[]> {
		const upsPayload = UpsMapper.toUpsRequest(request);

		try {
			const responseData = await this.executeWithAuth(upsPayload);

			return UpsMapper.toDomainQuotes(responseData);
		} catch (error: unknown) {
			throw this.handleError(error);
		}
	}

	private async executeWithAuth(payload: any): Promise<UpsRateResponse> {
		const token = await this.auth.getToken();

		try {
			const response = await this.http.post<UpsRateResponse>(
				'/rating/v1/shop',
				payload,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			return response.data;
		} catch (error: any) {
			// Transparent refresh on expiry (if 401 is returned)
			if (error.response?.status === 401) {
				this.auth.invalidate();
				const newToken = await this.auth.getToken();
				const retryResponse = await this.http.post<UpsRateResponse>(
					'/rating/v1/shop',
					payload,
					{ headers: { Authorization: `Bearer ${newToken}` } },
				);
				return retryResponse.data;
			}
			throw error;
		}
	}

	private handleError(error: unknown): Error {
		if ((error as any)?.isAxiosError) {
			const axiosError = error as any;
			const status = axiosError.response?.status || 500;
			const data = axiosError.response?.data;

			const detail =
				data?.response?.errors?.[0]?.message ||
				axiosError.message ||
				'Unknown UPS error';

			return new CarrierError(this.identifier, detail, status, data);
		}

		return error instanceof Error ? error : new Error(String(error));
	}
}
