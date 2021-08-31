import { assert } from "superstruct";
import type { RateLimitData } from "../../Util";
import { sRateLimitData } from "../../Util";

export class RateLimitError extends Error {
	name: "RateLimitError" = "RateLimitError";
	timeout: number;
	method: string;
	path: string;
	limit: number;
	constructor({ timeout, limit, method, path }: RateLimitData) {
		super(`A rate limit was hit on ${path}`);

		assert({ timeout, limit, method, path }, sRateLimitData);

		this.timeout = timeout;
		this.method = method;
		this.path = path;
		this.limit = limit;
	}
}

export default RateLimitError;
