import { assert } from "superstruct";
import { Numbers, sNumber, sString } from "../../Util";
import type { APIRequest } from "./APIRequest";

export class HTTPError extends Error {
	code: number;
	method: string;
	path: string;
	requestData: unknown;
	constructor(
		message: string,
		name: string,
		code: number = Numbers.defaultStatusCode,
		request: APIRequest
	) {
		super(message);

		assert(name, sString);
		assert(code, sNumber);

		this.name = name;
		this.code = code;
		this.method = request.method;
		this.path = request.path;
		this.requestData = request.options.data;
	}
}

export default HTTPError;
