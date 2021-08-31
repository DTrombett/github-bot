import https from "https";
import type { RequestInit, Response } from "node-fetch";
import fetch from "node-fetch";
import { assert, is } from "superstruct";
import { URLSearchParams } from "url";
import type { RequestMethod, RequestOptions } from "../../Util";
import { Numbers, sRequestMethod, sRequestOptions, sString } from "../../Util";
import type { RESTManager } from "./RESTManager";

const agent = new https.Agent({ keepAlive: true });
const baseHeaders = {
	"User-Agent": "DTrombett",
	"Time-Zone": "Europe/Rome",
} as const;
const etags: Record<string, string | undefined> = {};

export class APIRequest {
	method: RequestMethod;
	options: Required<RequestOptions>;
	url: `https://api.github.com${string}`;
	path: string;
	rest: RESTManager;
	constructor(
		rest: RESTManager,
		method: RequestMethod,
		path: string,
		{
			acceptType = "",
			data = null,
			headers = {},
			query = {},
			requestTimeout = Numbers.defaultRequestTimeout,
			json = !["raw", "diff", "sha", "patch", "html", "base64"].includes(acceptType),
			retry = true,
		}: RequestOptions = {}
	) {
		assert(method, sRequestMethod);
		assert(path, sString);
		assert({ acceptType, data, headers, query, requestTimeout, json }, sRequestOptions);
		this.rest = rest;
		this.path = path;
		if (["diff", "patch", "sha", "base64"].includes(acceptType) && json)
			throw new TypeError("Cannot accept type json with diff, patch, sha or base64");
		this.method = method;
		headers.Accept = `application/vnd.github.v3${acceptType && `.${acceptType}`}${
			json ? "+json" : ""
		}`;
		this.options = {
			acceptType,
			data,
			headers: { ...headers },
			query: { ...query },
			requestTimeout,
			json,
			retry,
		};
		const queryString = new URLSearchParams(
			Object.entries(query)
				.filter((keyValue): keyValue is [string, string[] | string] => keyValue[1] != null)
				.flatMap(([key, value]): [string, string][] =>
					Array.isArray(value) ? value.map((v): [typeof key, typeof v] => [key, v]) : [[key, value]]
				)
		).toString();
		this.url = `https://api.github.com${path}${queryString && `?${queryString}`}`;
	}

	make(): Promise<Response> {
		const controller = new AbortController();
		const headers: Record<string, string> = { ...baseHeaders, ...this.options.headers };
		const body = this.options.data != null ? JSON.stringify(this.options.data) : undefined;
		const etag = etags[this.url];
		if (this.options.data != null) headers["Content-Type"] = "application/json";
		if (etag != null) headers["If-None-Match"] = `"${etag}"`;
		const { GITHUB_TOKEN: token } = process.env;
		if (is(token, sString))
			headers.Authorization = `Basic ${Buffer.from(`DTrombett:${token}`).toString("base64")}`;

		const timeout = setTimeout(() => {
			controller.abort();
		}, this.options.requestTimeout).unref();
		return fetch(this.url, {
			method: this.method,
			headers,
			agent,
			body,
			signal: controller.signal as RequestInit["signal"],
		})
			.then((res) => {
				const newEtag = res.headers.get("etag");
				if (newEtag != null) [, etags[this.url]] = newEtag.split('"');
				return res;
			})
			.finally(() => {
				clearTimeout(timeout);
			});
	}
}

export default APIRequest;
