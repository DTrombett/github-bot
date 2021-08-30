import type { Awaited, Client } from "discord.js";
import EventEmitter from "events";
import { assert } from "superstruct";
import type { APIRouter, ClientUserData, GitHubClientOptions, GitHubEvents } from "../Util";
import { ProjectData, sGitHubClientOptions } from "../Util";
import { UserManager } from "./managers/UserManager";
import RESTManager from "./rest/RESTManager";
import { ClientUser } from "./structures/ClientUser";

export const defaultRequestTimeout = 10_000;

export class GitHubClient extends EventEmitter {
	token: string;
	timeZone: string;
	discordClient: Client;
	userAgent: string;
	requestTimeout: number;
	rest = new RESTManager(this);
	user: ClientUser | null = null;
	users = new UserManager(this);

	constructor(options: GitHubClientOptions) {
		super();
		assert(options, sGitHubClientOptions);

		const {
			token,
			client,
			timeZone = "Europe/Rome",
			userAgent = `@${ProjectData.author}/${ProjectData.name}@${ProjectData.version}`,
			requestTimeout = defaultRequestTimeout,
		} = options;
		this.token = token;
		this.timeZone = timeZone;
		this.discordClient = client;
		this.userAgent = userAgent;
		this.requestTimeout = requestTimeout;
	}

	get api(): APIRouter {
		return this.rest.api;
	}

	async login(): Promise<ClientUser> {
		return this.rest.api.user.get<ClientUserData>().then((response) => {
			this.users.cache.set(response.data.login, (this.user = new ClientUser(this, response)));
			return this.user;
		});
	}

	override on<E extends keyof GitHubEvents>(
		event: E,
		listener: (...args: GitHubEvents[E]) => Awaited<void>
	): this {
		return super.on(event, listener as (...args: any[]) => void);
	}

	override emit<E extends keyof GitHubEvents>(event: E, ...args: GitHubEvents[E]): boolean {
		return super.emit(event, ...args);
	}
}
