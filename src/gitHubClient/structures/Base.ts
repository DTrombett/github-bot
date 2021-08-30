import { assert, instance, record } from "superstruct";
import { GitHubClient } from "..";
import type { ResponseData } from "../../Util";
import { sJson, sString } from "../../Util";

export class Base {
	/**
	 * The client that instantiated this request
	 */
	client!: GitHubClient;

	/**
	 * When this was last fetched
	 */
	lastUpdated: Date | null = null;

	protected _etag: string | null = null;
	protected _requestId: string | null = null;

	constructor(client: GitHubClient, { data, headers }: ResponseData) {
		assert(client, instance(GitHubClient));
		assert(data, record(sString, sJson));
		Object.defineProperty(this, "client", { value: client });
		this._patch({ headers, data });
	}

	/**
	 * The timestamp in milliseconds when this was last fetched
	 */
	get lastUpdatedTimestamp(): number | null {
		return this.lastUpdated?.getTime() ?? null;
	}

	_patch({ headers }: ResponseData): this {
		const etag = headers.get("etag");
		const requestId = headers.get("x-github-request-id");
		const lastUpdated = headers.get("date");

		if (etag != null) [, this._etag] = etag.split('"');
		if (requestId != null) this._requestId = requestId;
		if (lastUpdated != null) this.lastUpdated = new Date(lastUpdated);

		return this;
	}

	// eslint-disable-next-line class-methods-use-this
	fetch(): Promise<this> {
		return Promise.reject(new Error("Method not implemented in the Base object"));
	}
}

export default Base;
