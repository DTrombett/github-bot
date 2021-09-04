import { Collection } from "@discordjs/collection";
import type { GitHubClient } from "..";
import type { Json } from "../../Util";
import type { Base } from "../structures/Base";

export class BaseManager<
	V extends Base,
	D extends Json = Parameters<V["_patch"]>[0],
	T extends new (client: GitHubClient, data: D, ...args: any[]) => V = new (
		client: GitHubClient,
		data: D,
		...args: any[]
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
		Object.defineProperty(this, "client", { value: client });
		this._holds = holds;
		this.routers = routers ?? [];
	}

	async fetch(id: string): Promise<V> {
		return (
			this.cache.get(id)?.fetch() ??
			this.client
				.api(...this.routers.map((route) => (route === ":id" ? id : route)))
				.get<D, false>()
				.then((data) =>
					data != null ? this.add(data, id) : Promise.reject(new Error("Unexpected null response"))
				)
		);
	}

	add(response: D, id: string): V {
		const existing = this.cache.get(id);
		if (existing) return existing._patch(response);
		const entry = new this._holds(this.client, response);
		this.cache.set(id, entry);
		return entry;
	}
}

export default BaseManager;
