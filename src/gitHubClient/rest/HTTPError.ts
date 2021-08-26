import { assert, instance } from "superstruct";
import { sNumber, sString } from "../../Util";
import APIRequest from "./APIRequest";

const defaultCode = 500;

export class HTTPError extends Error {
	code: number;
	method: string;
	path: string;
	requestData: unknown;
	constructor(message: string, name: string, code = defaultCode, request: APIRequest) {
		super(message);

		assert(name, sString);
		assert(code, sNumber);
		assert(request, instance(APIRequest));
		this.name = name;
		this.code = code;
		this.method = request.method;
		this.path = request.path;
		this.requestData = request.options.data;
	}
}

export default HTTPError;
