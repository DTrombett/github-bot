import { testClient } from "../..";
import { APIRequest } from "../../../src/gitHubClient/rest/APIRequest";
import RESTManager from "../../../src/gitHubClient/rest/RESTManager";
import { Numbers, UserData } from "../../../src/Util/UtilityTypes";
const testRestManager = new RESTManager(testClient);
test("test the APIRequest class", async () => {
	// Test a request with no options
	expect(new APIRequest(testRestManager, "GET", "")).toBeInstanceOf(APIRequest);

	// Test a request with an empty object
	expect(new APIRequest(testRestManager, "GET", "", {})).toBeInstanceOf(APIRequest);

	// json option with diff, patch, sha or base64 format should throw
	try {
		new APIRequest(testRestManager, "GET", "", { acceptType: "base64", json: true });
		// Force error
		expect(true).toBe(false);
	} catch (err) {
		expect(err).toBeInstanceOf(TypeError);
	}

	// Test an accepted type
	expect(
		new APIRequest(testRestManager, "GET", "", { acceptType: "raw" }).options.headers.Accept
	).toBe("application/vnd.github.v3.raw");
	expect(
		new APIRequest(testRestManager, "GET", "", { acceptType: "text" }).options.headers.Accept
	).toBe("application/vnd.github.v3.text+json");

	// Test the query
	expect(
		new APIRequest(testRestManager, "GET", "", {
			query: { test: "testing", query: ["foo", "bar"] },
		}).url
	).toBe(`https://api.github.com?test=testing&query=foo&query=bar`);
	expect(
		new APIRequest(testRestManager, "GET", "", { acceptType: "text" }).options.headers.Accept
	).toBe("application/vnd.github.v3.text+json");

	// Test properties
	const testAPIRequest = new APIRequest(testRestManager, "GET", "/user");
	expect(testAPIRequest.method).toBe("GET");
	expect(testAPIRequest.rest).toBe(testRestManager);
	expect(testAPIRequest.path).toBe("/user");
	expect(testAPIRequest.options).toEqual({
		acceptType: "",
		data: null,
		headers: { Accept: "application/vnd.github.v3+json" },
		query: {},
		requestTimeout: Numbers.defaultRequestTimeout,
		json: true,
		retry: true,
	});

	// Execute the request
	await expect(
		new APIRequest(testRestManager, "POST", "/user", { data: { foo: "bar" } })
			.make()
			.then((res) => res.status)
	).resolves.toBe(401);
	await expect(
		new APIRequest(testRestManager, "GET", "/users/DTrombett").make().then((res) => res.json())
	).resolves.toMatchObject<UserData>({ login: "DTrombett" });
	await expect(
		new APIRequest(testRestManager, "GET", "/users/DTrombett").make().then((res) => res.status)
	).resolves.toBe(304);
});
