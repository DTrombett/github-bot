import { FetchError, Headers, Response } from "node-fetch";
import {
	mockNodeFetch,
	testAPIRequest,
	testClient,
	testGitHubAPIError,
	testRequestHandler,
	testRestManager,
	testValidAPIRequest,
} from "../..";
import GitHubAPIError from "../../../src/gitHubClient/rest/GitHubAPIError";
import HTTPError from "../../../src/gitHubClient/rest/HTTPError";
import RequestHandler from "../../../src/gitHubClient/rest/RequestHandler";

mockNodeFetch()
	.mockResolvedValueOnce(
		new Response(JSON.stringify({ login: "DTrombett" }), {
			headers: {
				"x-ratelimit-limit": "60",
				"x-ratelimit-remaining": "59",
				"x-ratelimit-reset": `${Math.round(Date.now() / 1000) + 59 * 60}`,
			},
			statusText: "OK",
		})
	)
	.mockRejectedValueOnce(testGitHubAPIError)
	.mockResolvedValueOnce(
		new Response(undefined, {
			headers: {
				"x-ratelimit-limit": "60",
				"x-ratelimit-remaining": "58",
				"x-ratelimit-reset": `${Math.round(Date.now() / 1000) + 59 * 60}`,
			},
			status: 204,
			statusText: "No content",
		})
	);

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

	// Test requests
	await expect(testRequestHandler.push(testValidAPIRequest)).resolves.toBeDefined();
	testRequestHandler.manager.globalRemaining = globalRemaining;
	testRequestHandler.manager.globalReset = globalReset;
	await expect(testRequestHandler.globalDelayFor(1)).resolves.toBeNull();
	await expect(testClient.api.user.head()).rejects.toBeInstanceOf(GitHubAPIError);
	await expect(testClient.api.users.DTrombett.following("davi-fonto").get()).resolves.toBe(204);
	expect(testRequestHandler._inactive).toBe(true);
});
