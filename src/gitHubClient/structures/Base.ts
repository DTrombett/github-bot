import type { GitHubClient } from "..";
import type { Json } from "../../Util";

export class Base {
	/**
	 * The client that instantiated this request
	 */
	client!: GitHubClient;

	/**
	 * When this was last fetched
	 */
	lastUpdated: Date = new Date();

	constructor(client: GitHubClient, data: Json) {
		Object.defineProperty(this, "client", { value: client });
		this._patch(data);
	}

	/**
	 * The timestamp in milliseconds when this was last fetched
	 */
	get lastUpdatedTimestamp(): number {
		return this.lastUpdated.getTime();
	}

	_patch(_data: Json): this {
		return this;
	}

	fetch(): Promise<this> {
		return Promise.reject(new Error(`Method not implemented in ${this.constructor.name} class`));
	}
}

export default Base;
