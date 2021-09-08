import { testAPIRequest, testHTTPError } from "../..";
import { HTTPError } from "../../../src/gitHubClient/rest/HTTPError";
import { Numbers } from "../../../src/Util";

test("test the HTTP error class", () => {
	expect(testHTTPError.code).toBe(501);
	expect(testHTTPError.message).toBe("test");
	expect(testHTTPError.method).toBe("GET");
	expect(testHTTPError.name).toBe("FetchError");
	expect(testHTTPError.path).toBe("/user");
	expect(testHTTPError.requestData).toBe(null);

	// Test default status code
	expect(new HTTPError({ message: "test", name: "FetchError", request: testAPIRequest }).code).toBe(
		Numbers.defaultStatusCode
	);
});
