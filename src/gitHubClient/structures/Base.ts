import { assert, instance } from "superstruct";
import { GitHubClient } from "..";

export class Base {
	/**
	 * The client that instantiated this request
	 */
	client!: GitHubClient;

	/**
	 * When this was last fetched
	 */
	lastUpdated: Date | null = new Date();

	constructor(client: GitHubClient, data: unknown) {
		assert(client, instance(GitHubClient));
		Object.defineProperty(this, "client", { value: client });
		this._patch(data);
	}

	/**
	 * The timestamp in milliseconds when this was last fetched
	 */
	get lastUpdatedTimestamp(): number | null {
		return this.lastUpdated?.getTime() ?? null;
	}

	_patch(_data: unknown): this {
		return this;
	}

	// eslint-disable-next-line class-methods-use-this
	fetch(): Promise<this> {
		return Promise.reject(new Error("Method not implemented in the Base object"));
	}
}

export default Base;
