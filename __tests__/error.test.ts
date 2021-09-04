import { errorMessage, logError } from "../src/Util";

test("log an error", () => {
	expect(logError(new Error("An error occurred"))).toBe(undefined);
});
test("get an error message", () => {
	expect(errorMessage(new Error("An error occurred"))).toBe("An error occurred");
	expect(errorMessage("Not an error")).toBe("Unknown error");
});
