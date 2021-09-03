import type { RateLimitData } from "../../Util";

export class RateLimitError extends Error {
	name: "RateLimitError" = "RateLimitError";
	timeout: number;
	method: string;
	path: string;
	limit: number;
	constructor(data: RateLimitData) {
		super(`A rate limit was hit on ${data.path}`);

		this.timeout = data.timeout;
		this.method = data.method;
		this.path = data.path;
		this.limit = data.limit;
	}
}

export default RateLimitError;
