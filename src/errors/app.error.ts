export abstract class AppError extends Error {
	public readonly isOperational: boolean;

	constructor(
		public override readonly message: string,
		public readonly statusCode: number = 500,
	) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}
