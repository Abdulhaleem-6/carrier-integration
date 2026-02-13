import axios, { type AxiosInstance } from 'axios';
import { CarrierError } from '../../../errors/carrier.error.js';

export interface UpsAuthConfig {
	clientId: string;
	clientSecret: string;
	baseUrl: string;
	[key: string]: any;
}

export class UpsAuthManager {
	private token: string | null = null;
	private expiresAt: number | null = null;
	private readonly http: AxiosInstance;

	constructor(private readonly config: UpsAuthConfig) {
		this.http = axios.create({
			baseURL: config.baseUrl,
			timeout: 5000,
		});
	}

	async getToken(): Promise<string> {
		if (this.isTokenValid()) {
			return this.token!;
		}

		return this.fetchNewToken();
	}

	invalidate(): void {
		this.token = null;
		this.expiresAt = null;
	}

	private isTokenValid(): boolean {
		if (!this.token || !this.expiresAt) return false;
		// Add a 60-second buffer to prevent expiry mid-flight
		return Date.now() < this.expiresAt - 60000;
	}

	private async fetchNewToken(): Promise<string> {
		try {
			const authHeader = Buffer.from(
				`${this.config.clientId}:${this.config.clientSecret}`,
			).toString('base64');

			const response = await this.http.post(
				'/security/v1/oauth/token',
				new URLSearchParams({ grant_type: 'client_credentials' }),
				{
					headers: {
						Authorization: `Basic ${authHeader}`,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			);

			const { access_token, expires_in } = response.data;

			this.token = access_token;
			this.expiresAt = Date.now() + parseInt(expires_in) * 1000;

			return this.token!;
		} catch (error: any) {
			throw new CarrierError(
				'UPS',
				'Failed to authenticate with UPS',
				error.response?.status || 500,
				error.response?.data,
			);
		}
	}
}
