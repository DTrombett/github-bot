import { AsyncQueue } from "@sapphire/async-queue";
import type { FetchError, Response } from "node-fetch";
import { assert, instance } from "superstruct";
import { setTimeout } from "timers/promises";
import type { ErrorData } from "../../Util";
import { logError, Numbers, sNumber } from "../../Util";
import { APIRequest } from "./APIRequest";
import { GitHubAPIError } from "./GitHubAPIError";
import { HTTPError } from "./HTTPError";
import { RateLimitError } from "./RateLimitError";
import type { RESTManager } from "./RESTManager";

export const parseResponse = async <D>(res: Response): Promise<D> =>
	(res.headers.get("content-type")?.startsWith("application/json") === true
		? res.json()
		: res.buffer()) as Promise<D>;
export const calculateReset = (reset: string): number =>
	new Date(Number(reset) * Numbers.milliseconds).getTime();

export class RequestHandler {
	manager: RESTManager;
	queue: AsyncQueue;
	reset: number;
	remaining: number;
	limit: number;
	constructor(manager: RESTManager) {
		this.manager = manager;
		this.queue = new AsyncQueue();
		this.reset = -1;
		this.remaining = -1;
		this.limit = -1;
	}

	private static onRateLimit(request: APIRequest, limit: number, timeout: number): void {
		logError(
			new RateLimitError({
				timeout,
				limit,
				method: request.method,
				path: request.path,
			})
		);
	}
	private static onParseError(request: APIRequest): (reason: FetchError) => never {
		return (err: FetchError) => {
			throw new HTTPError(err.message, err.constructor.name, undefined, request);
		};
	}
	private static onFetchError(request: APIRequest): (reason: FetchError) => never {
		return (error: FetchError) => {
			throw new HTTPError(error.message, error.constructor.name, undefined, request);
		};
	}

	async push<D>(request: APIRequest): Promise<D | null> {
		await this.queue.wait().catch(console.error);
		return this.execute<D>(request).finally(() => {
			this.queue.shift();
		});
	}

	get limited(): boolean {
		return (
			this.manager.globalReset !== null &&
			this.manager.globalRemaining <= 0 &&
			Date.now() < this.manager.globalReset
		);
	}

	get _inactive(): boolean {
		return this.queue.remaining === 0 && !this.limited;
	}

	globalDelayFor(ms: number): Promise<null> {
		assert(ms, sNumber);
		return setTimeout(ms, (this.manager.globalDelay = null));
	}

	async execute<D>(request: APIRequest): Promise<D | null> {
		assert(request, instance(APIRequest));
		if (this.limited)
			this.manager.globalDelay ??= this.globalDelayFor(
				this.manager.globalReset != null
					? this.manager.globalReset + Numbers.milliseconds - Date.now()
					: 0
			);
		await this.manager.globalDelay;
		if (this.manager.globalReset == null || this.manager.globalReset < Date.now()) {
			this.manager.globalReset = Date.now() + Numbers.milliseconds;
			this.manager.globalRemaining = this.manager.globalLimit;
		}
		this.manager.globalRemaining--;
		const res = await request.make().catch(RequestHandler.onFetchError(request));
		const limit = res.headers.get("x-ratelimit-limit");
		const remaining = res.headers.get("x-ratelimit-remaining");
		const reset = res.headers.get("x-ratelimit-reset");

		this.limit = limit != null ? Number(limit) : Infinity;
		this.remaining = remaining != null ? Number(remaining) : 1;
		this.reset = reset != null ? calculateReset(reset) : Date.now();

		const retryAfter = !this.remaining ? this.reset * Numbers.milliseconds - Date.now() : 0;

		if (retryAfter > 0) {
			this.manager.globalRemaining = 0;
			this.manager.globalReset = Date.now() + retryAfter;
		}
		if (res.ok) return parseResponse(res);
		if (res.status === Numbers.notModifiedCode) return null;
		if (res.status >= Numbers.serverErrorCode && res.status < Numbers.unknownCode) {
			if (request.options.retry) return this.execute(request);
			throw new HTTPError(res.statusText, res.constructor.name, res.status, request);
		}
		if (res.status === Numbers.rateLimitCode) {
			const limit = this.manager.globalLimit;
			const timeout = this.manager.globalReset + Numbers.milliseconds - Date.now();

			RequestHandler.onRateLimit(request, limit, timeout);
		}
		const response = await parseResponse(res).catch(RequestHandler.onParseError(request));
		throw new GitHubAPIError(response as ErrorData, res.status, request);
	}
}

export default RequestHandler;
