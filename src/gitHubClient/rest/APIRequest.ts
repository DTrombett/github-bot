import https from "https";
import type { RequestInit, Response } from "node-fetch";
import fetch from "node-fetch";
import { assert, instance, is } from "superstruct";
import { URLSearchParams } from "url";
import type { RequestMethod, RequestOptions } from "../../Util";
import { ConditionalHeaders, sRequestMethod, sRequestOptions, sString } from "../../Util";
import RESTManager from "./RESTManager";

const agent = new https.Agent({ keepAlive: true });
const defaultRequestTimeout = 60000;

const baseHeaders = {
	"User-Agent": "DTrombett",
	"Time-Zone": "Europe/Rome",
} as const;

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
			requestTimeout = defaultRequestTimeout,
			json = !["raw", "diff", "sha", "patch", "html", "base64"].includes(acceptType),
			onlyIf = {},
			retry = true,
		}: RequestOptions = {}
	) {
		assert(rest, instance(RESTManager));
		assert(method, sRequestMethod);
		assert(path, sString);
		assert({ acceptType, data, headers, query, requestTimeout, json, onlyIf }, sRequestOptions);
		this.rest = rest;
		this.path = path;
		if (["diff", "patch", "sha", "base64"].includes(acceptType) && json)
			throw new TypeError("Cannot accept type json with diff, patch, sha or base64");
		this.method = method;
		headers.Accept = `application/vnd.github.v3${acceptType && `.${acceptType}`}${
			json ? "+json" : ""
		}`;
		for (const condition in onlyIf)
			if (Object.prototype.hasOwnProperty.call(onlyIf, condition)) {
				const element = onlyIf[condition as keyof typeof onlyIf];
				if (element != null)
					headers[ConditionalHeaders[condition as keyof typeof onlyIf]] = element;
			}
		this.options = {
			acceptType,
			data,
			headers: { ...headers },
			query: { ...query },
			requestTimeout,
			json,
			onlyIf: { ...onlyIf },
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
		const headers: Record<string, string> = { ...baseHeaders, ...this.options.headers };
		const body = this.options.data != null ? JSON.stringify(this.options.data) : undefined;
		if (this.options.data != null) headers["Content-Type"] = "application/json";
		if (is(process.env.GITHUB_TOKEN, sString))
			headers.Authorization = `Basic ${Buffer.from(
				`DTrombett:${process.env.GITHUB_TOKEN}`
			).toString("base64")}`;
		const controller = new AbortController();
		const timeout = setTimeout(() => {
			controller.abort();
		}, this.options.requestTimeout).unref();
		return fetch(this.url, {
			method: this.method,
			headers,
			agent,
			body,
			signal: controller.signal as RequestInit["signal"],
		}).finally(() => {
			clearTimeout(timeout);
		});
	}
}

export default APIRequest;
