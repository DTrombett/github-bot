import { assert, instance } from "superstruct";
import type { RequestMethod } from "../../Util";
import { sErrorData, sNumber } from "../../Util";
import { APIRequest } from "./APIRequest";

export type ErrorCode =
	| "already_exists"
	| "invalid"
	| "missing_field"
	| "missing"
	| "unprocessable";
export type DetailedError =
	| {
			message: string;
			documentation_url?: string;
			resource: string;
			field: string;
			code: "custom";
	  }
	| {
			resource: string;
			field: string;
			code: ErrorCode;
	  };
export type ErrorData = {
	message: string;
	documentation_url?: string;
	errors?: DetailedError[];
};
export enum ErrorDescription {
	missing = "This resource does not exist",
	missing_field = "This field is required",
	invalid = "The formatting of this field is invalid",
	already_exists = "Another resource has the same value as this field",
	unprocessable = "This field is not valid",
}

/**
 * Represents an error from the GitHub API.
 */
class GitHubAPIError extends Error {
	name: "GitHubAPIError" = "GitHubAPIError";
	method: RequestMethod;
	path: string;
	httpStatus: number;
	requestData: unknown;
	constructor(error: ErrorData, status: number, request: APIRequest) {
		super();

		assert(error, sErrorData);
		assert(status, sNumber);
		assert(request, instance(APIRequest));

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
