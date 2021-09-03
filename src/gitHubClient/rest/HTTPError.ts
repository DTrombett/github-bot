import type { HTTPErrorData } from "../../Util";
import { Numbers } from "../../Util";

export class HTTPError extends Error {
	code: number;
	method: string;
	path: string;
	requestData: unknown;
	constructor(error: HTTPErrorData) {
		super(error.message);

		this.name = error.name;
		this.code = error.code ?? Numbers.defaultStatusCode;
		this.method = error.request.method;
		this.path = error.request.path;
		this.requestData = error.request.options.data;
	}
}

export default HTTPError;
