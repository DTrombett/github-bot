import { inspect } from "util";
import { ConsoleAndFileLogger, FileLogger } from "../../src/Util/Console";
import { testError } from "..";

test("log an error to the console and the log file", () => {
	expect(ConsoleAndFileLogger.info("test")).toBe(ConsoleAndFileLogger);
});

test("log an error to the log file", () => {
	expect(FileLogger.info(inspect(testError))).toBe(FileLogger);
});
