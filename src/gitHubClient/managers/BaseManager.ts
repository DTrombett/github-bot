import { Collection } from "discord.js";
import { assert, instance } from "superstruct";
import { GitHubClient } from "..";
import type { ResponseData } from "../../Util";
import type Base from "../structures/Base";

export class BaseManager<
	V extends Base,
	D extends V["_patch"] extends (response: ResponseData<infer R>) => V
		? R
		: never = V["_patch"] extends (response: ResponseData<infer R>) => V ? R : never,
	T extends new (client: GitHubClient, response: ResponseData<D>) => V = new (
		client: GitHubClient,
		response: ResponseData<D>
	) => V
> {
	/**
	 * The client that instantiated this
	 */
	client!: GitHubClient;

	/**
	 * The cache of this manager
	 */
	cache = new Collection<string, V>();

	protected _holds: T;
	private routers: string[];

	constructor(client: GitHubClient, holds: T, routers?: string[]) {
		assert(client, instance(GitHubClient));
		Object.defineProperty(this, "client", { value: client });
		this._holds = holds;
		this.routers = routers ?? [];
	}

	/**
	 * Fetch a user from the API.
	 * @param username The username of the user to fetch
	 * @returns The fetched user
	 */
	async fetch(id: string): Promise<V> {
		return (
			this.cache.get(id)?.fetch() ??
			this.add(
				await this.client
					.api(...this.routers.map((route) => (route === ":id" ? id : route)))
					.get<D>(),
				id
			)
		);
	}

	add(response: ResponseData<D>, id: string): V {
		const existing = this.cache.get(id);
		if (existing) return existing._patch(response);
		const entry = new this._holds(this.client, response);
		this.cache.set(id, entry);
		return entry;
	}
}

export default BaseManager;
