import type Collection from "@discordjs/collection";
import type { Client } from "discord.js";
import type { APIRouter, ClientUserData, GitHubClientOptions } from "../Util";
import { Numbers, ProjectData } from "../Util";
import { UserManager } from "./managers/UserManager";
import RESTManager from "./rest/RESTManager";
import { ClientUser } from "./structures/ClientUser";
import type User from "./structures/User";

export class GitHubClient {
	token: string;
	timeZone: string;
	discordClient: Client;
	userAgent: string;
	requestTimeout: number;
	rest = new RESTManager(this);
	user!: ClientUser;
	users = new UserManager(this);

	constructor(options: GitHubClientOptions) {
		this.token = options.token;
		this.timeZone = options.timeZone ?? "Europe/Rome";
		this.discordClient = options.client;
		this.userAgent =
			options.userAgent ?? `@${ProjectData.author}/${ProjectData.name}@${ProjectData.version}`;
		this.requestTimeout = options.requestTimeout ?? Numbers.defaultRequestTimeout;
	}

	get api(): APIRouter {
		return this.rest.api;
	}

	/**
	 * Fetch the authenticated user and set the user property.
	 * @returns The fetched client user
	 */
	async login(): Promise<ClientUser> {
		return this.api.user.get<ClientUserData, false>().then((user) => {
			this.users.cache.set(user!.login, (this.user = new ClientUser(this, user!)));
			return this.user;
		});
	}

	/**
	 * Fetch the followers of a user.
	 * @param username - The user to get
	 * @param perPage - How many followers to get
	 * @param page - The page to get
	 * @returns A collection of followers of the user
	 */
	fetchFollowers(
		username?: string | null,
		perPage = Numbers.resultsPerPage,
		page = 1
	): Promise<Collection<string, User>> {
		return (
			username != null
				? this.users.cache.get(username) ?? this.users.add({ login: username })
				: this.user
		).fetchFollowers(perPage, page);
	}
}
