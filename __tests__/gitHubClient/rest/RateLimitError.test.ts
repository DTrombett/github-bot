import { testRateLimitError } from "../..";

test("test a rate limit error", () => {
	expect(testRateLimitError.limit).toBe(5_000);
	expect(testRateLimitError.message).toBe("A rate limit was hit on /user");
	expect(testRateLimitError.method).toBe("GET");
	expect(testRateLimitError.path).toBe("/user");
	expect(testRateLimitError.name).toBe("RateLimitError");
	expect(testRateLimitError.timeout).toBe(60_000);
});
