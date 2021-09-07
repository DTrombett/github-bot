import { errorMessage, logError } from "../../src/Util/error";
import { testError } from "..";

test("log an error", () => {
	expect(logError(testError)).toBe(undefined);
	expect(logError("test")).toBe(undefined);
});

test("get an error message", () => {
	expect(errorMessage(testError)).toBe("An error occurred");
	expect(errorMessage("Not an error")).toBe("Unknown error");
});
