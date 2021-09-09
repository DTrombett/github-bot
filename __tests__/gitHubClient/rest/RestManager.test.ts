import { Response } from "node-fetch";
import { mockNodeFetch, testRestManager } from "../..";

jest.useFakeTimers();

test("test the RestManager", async () => {
	expect(testRestManager.globalDelay).toBe(null);
	expect(testRestManager.globalLimit).toBeGreaterThanOrEqual(0);
	expect(testRestManager.globalRemaining).toBeGreaterThanOrEqual(0);

	mockNodeFetch(() => Promise.resolve(new Response()));
	expect(testRestManager.request("GET", "/users/Dtrombett")).resolves.toBeDefined();
	// Test the existing handler
	await expect(testRestManager.request("GET", "/users/Dtrombett")).resolves.toBeDefined();
});
