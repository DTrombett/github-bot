import { AsyncQueue } from "@sapphire/async-queue";
import type { FetchError } from "node-fetch";
import { setTimeout } from "timers/promises";
import type { ErrorData } from "../../Util";
import { logError, Numbers } from "../../Util";
import type { APIRequest } from "./APIRequest";
import { GitHubAPIError } from "./GitHubAPIError";
import { HTTPError } from "./HTTPError";
import { RateLimitError } from "./RateLimitError";
import type { RESTManager } from "./RESTManager";

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
	private static onFetchError(request: APIRequest) {
		return (error: FetchError) =>
			Promise.reject(
				new HTTPError({
					message: error.message,
					name: error.constructor.name,
					request,
				})
			);
	}

	async push<D>(request: APIRequest): Promise<D | null> {
		await this.queue.wait();
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
		return setTimeout(ms, (this.manager.globalDelay = null));
	}

	async execute<D>(request: APIRequest): Promise<D | null> {
		if (this.limited)
			this.manager.globalDelay ??= this.globalDelayFor(
				this.manager.globalReset! + Numbers.milliseconds - Date.now()
			);
		await this.manager.globalDelay;
		if (this.manager.globalReset == null || this.manager.globalReset < Date.now()) {
			this.manager.globalReset = Date.now() + Numbers.milliseconds;
			this.manager.globalRemaining = this.manager.globalLimit;
		}
		this.manager.globalRemaining--;
		const res = await request.make().catch(RequestHandler.onFetchError(request));
		const limit = res.headers.get("x-ratelimit-limit")!;
		const remaining = res.headers.get("x-ratelimit-remaining")!;
		const reset = res.headers.get("x-ratelimit-reset")!;

		this.limit = Number(limit);
		this.remaining = Number(remaining);
		this.reset = calculateReset(reset);

		const retryAfter = !this.remaining
			? /* istanbul ignore next */
			  this.reset * Numbers.milliseconds - Date.now()
			: 0;

		/* istanbul ignore next */
		if (retryAfter > 0) {
			this.manager.globalRemaining = 0;
			this.manager.globalReset = Date.now() + retryAfter;
		}
		if (res.ok) return res.json().catch(() => res.status) as Promise<D>;
		if (res.status >= Numbers.multipleChoices && res.status < Numbers.badRequestCode) return null;
		/* istanbul ignore next */
		if (res.status >= Numbers.serverErrorCode && res.status < Numbers.unknownCode) {
			if (request.options.retry) return this.execute(request);
			throw new HTTPError({
				message: res.statusText,
				name: res.constructor.name,
				code: res.status,
				request,
			});
		}
		/* istanbul ignore next */
		if (res.status === Numbers.rateLimitCode)
			RequestHandler.onRateLimit(
				request,
				this.manager.globalLimit,
				this.manager.globalReset + Numbers.milliseconds - Date.now()
			);

		throw new GitHubAPIError(
			await (res.json() as Promise<ErrorData>).catch(() => ({ message: res.statusText })),
			res.status,
			request
		);
	}
}

export default RequestHandler;
