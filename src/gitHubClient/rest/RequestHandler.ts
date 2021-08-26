import { AsyncQueue } from "@sapphire/async-queue";
import type { FetchError, Response } from "node-fetch";
import type { ErrorData } from "./GitHubAPIError";
import DiscordAPIError from "./GitHubAPIError";
import HTTPError from "./HTTPError";
import RESTManager from "./RESTManager";
import { setTimeout } from "timers/promises";
import APIRequest from "./APIRequest";
import { RateLimitError } from "./RateLimitError";
import { assert, instance } from "superstruct";
import { sNumber } from "../../Util";

export const errorCodes = {
	badRequest: 400,
	serverError: 500,
	rateLimit: 429,
	unknown: 600,
} as const;

const milliseconds = 1_000;

export const parseResponse = (res: Response): Promise<unknown> =>
	res.headers.get("Content-Type")?.startsWith("application/json") === true
		? res.json()
		: res.buffer();
export const calculateReset = (reset: string): number =>
	new Date(Number(reset) * milliseconds).getTime();

export class RequestHandler {
	manager: RESTManager;
	queue: AsyncQueue;
	reset: number;
	remaining: number;
	limit: number;
	constructor(manager: RESTManager) {
		assert(manager, instance(RESTManager));
		this.manager = manager;
		this.queue = new AsyncQueue();
		this.reset = -1;
		this.remaining = -1;
		this.limit = -1;
	}

	private static onRateLimit(request: APIRequest, limit: number, timeout: number): void {
		request.rest.client.emit(
			"rateLimit",
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

	async push(request: APIRequest): Promise<unknown> {
		await this.queue.wait().catch(console.error);
		return this.execute(request).finally(() => {
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

	// eslint-disable-next-line complexity
	async execute(request: APIRequest): Promise<unknown> {
		assert(request, instance(APIRequest));
		if (this.limited)
			this.manager.globalDelay ??= this.globalDelayFor(
				this.manager.globalReset != null ? this.manager.globalReset + milliseconds - Date.now() : 0
			);
		await this.manager.globalDelay;
		if (this.manager.globalReset == null || this.manager.globalReset < Date.now()) {
			this.manager.globalReset = Date.now() + milliseconds;
			this.manager.globalRemaining = this.manager.globalLimit;
		}
		this.manager.globalRemaining--;
		const res = await request.make().catch(RequestHandler.onFetchError(request));
		const limit = res.headers.get("X-RateLimit-Limit");
		const remaining = res.headers.get("X-RateLimit-Remaining");
		const reset = res.headers.get("X-RateLimit-Reset");

		this.limit = limit != null ? Number(limit) : Infinity;
		this.remaining = remaining != null ? Number(remaining) : 1;
		this.reset = reset != null ? calculateReset(reset) : Date.now();

		const retryAfter = !this.remaining ? this.reset * milliseconds - Date.now() : 0;

		if (retryAfter > 0) {
			this.manager.globalRemaining = 0;
			this.manager.globalReset = Date.now() + retryAfter;
		}
		if (res.ok) return parseResponse(res);
		if (res.status >= errorCodes.badRequest && res.status < errorCodes.serverError) {
			if (res.status === errorCodes.rateLimit) {
				const limit = this.manager.globalLimit;
				const timeout = this.manager.globalReset + milliseconds - Date.now();

				RequestHandler.onRateLimit(request, limit, timeout);
			}

			const data = await parseResponse(res).catch(RequestHandler.onParseError(request));

			throw new DiscordAPIError(data as ErrorData, res.status, request);
		}
		if (res.status >= errorCodes.serverError && res.status < errorCodes.unknown) {
			if (request.options.retry) return this.execute(request);
			throw new HTTPError(res.statusText, res.constructor.name, res.status, request);
		}
		return null;
	}
}

export default RequestHandler;
