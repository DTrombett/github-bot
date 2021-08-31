import { assert } from "superstruct";
import type { ErrorData, RequestMethod } from "../../Util";
import { ErrorDescription, sErrorData, sNumber } from "../../Util";
import type { APIRequest } from "./APIRequest";

/**
 * Represents an error from the GitHub API.
 */
export class GitHubAPIError extends Error {
	name: "GitHubAPIError" = "GitHubAPIError";
	method: RequestMethod;
	path: string;
	httpStatus: number;
	requestData: unknown;
	constructor(error: ErrorData, status: number, request: APIRequest) {
		super();

		assert(error, sErrorData);
		assert(status, sNumber);

		this.message = [error.message]
			.concat(
				error.errors?.map(
					(err) =>
						`${err.resource} ${err.field}: ${
							"message" in err
								? `${err.message}${
										err.documentation_url != null ? `\nDocumentation: ${err.documentation_url}` : ""
								  }`
								: ErrorDescription[err.code]
						}`
				) ?? []
			)
			.join("\n");
		this.method = request.method;
		this.path = request.path;
		this.httpStatus = status;
		this.requestData = request.options.data;
	}
}
export default GitHubAPIError;
