import { FetchError } from "node-fetch";
import {
	testAPIRequest,
	testClient,
	testRequestHandler,
	testRestManager,
	testValidAPIRequest,
} from "../..";
import APIRequest from "../../../src/gitHubClient/rest/APIRequest";
import GitHubAPIError from "../../../src/gitHubClient/rest/GitHubAPIError";
import HTTPError from "../../../src/gitHubClient/rest/HTTPError";
import RequestHandler from "../../../src/gitHubClient/rest/RequestHandler";
import { UserData } from "../../../src/Util";

test("test the request handler", async () => {
	// Test private methods
	expect(
		(
			RequestHandler as unknown as { onRateLimit: typeof RequestHandler["onRateLimit"] }
		).onRateLimit(testAPIRequest, 5_000, 60_000)
	).toBe(undefined);
	expect(
		(
			RequestHandler as unknown as { onFetchError: typeof RequestHandler["onFetchError"] }
		).onFetchError(testAPIRequest)(new FetchError("An error occurred", "test"))
	).rejects.toBeInstanceOf(HTTPError);

	// Test getters
	expect(testRequestHandler.limited).toBe(false);
	let { globalRemaining } = testRequestHandler.manager;
	testRequestHandler.manager.globalRemaining = -1;
	let { globalReset } = testRequestHandler.manager;
	testRequestHandler.manager.globalReset = Date.now() + 1000;
	expect(testRequestHandler.limited).toBe(true);
	await expect(testRequestHandler.push<UserData>(testValidAPIRequest)).resolves.toBeDefined();
	testRequestHandler.manager.globalRemaining = globalRemaining;
	testRequestHandler.manager.globalReset = globalReset;
	await expect(testRequestHandler.globalDelayFor(1)).resolves.toBeNull();
	await expect(testClient.api.user.head<never>()).rejects.toBeInstanceOf(GitHubAPIError);
	await expect(testClient.api.users.DTrombett.following("davi-fonto").get<never>()).resolves.toBe(
		204
	);
	expect(testRequestHandler._inactive).toBe(true);
});
