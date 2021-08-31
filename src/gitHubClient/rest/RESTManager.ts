import { Collection } from "@discordjs/collection";
import { APIRequest } from "./APIRequest";
import { buildRoute } from "./APIRouter";
import { RequestHandler } from "./RequestHandler";
import type { GitHubClient } from "..";
import type { APIRouter, RequestMethod, RequestOptions } from "../../Util";
import { Numbers } from "../../Util";

export class RESTManager {
	client: GitHubClient;
	handlers: Collection<string, RequestHandler>;
	globalLimit: number;
	globalRemaining: number;
	globalReset: number | null;
	globalDelay: Promise<null> | null;
	constructor(client: GitHubClient) {
		this.client = client;
		this.handlers = new Collection<string, RequestHandler>();
		this.globalLimit = 2;
		this.globalRemaining = this.globalLimit;
		this.globalReset = null;
		this.globalDelay = null;
		setInterval(() => {
			this.handlers.sweep((handler) => handler._inactive);
		}, Numbers.sweepInterval).unref();
	}

	get api(): APIRouter {
		return buildRoute(this);
	}

	request<D>(method: RequestMethod, url: string, options: RequestOptions = {}): Promise<D | null> {
		const apiRequest = new APIRequest(this, method, url, options);
		let handler = this.handlers.get(apiRequest.path);
		if (!handler) {
			handler = new RequestHandler(this);
			this.handlers.set(apiRequest.path, handler);
		}
		return handler.push(apiRequest);
	}
}

export default RESTManager;
