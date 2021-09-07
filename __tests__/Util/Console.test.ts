import { inspect } from "util";
import { ConsoleAndFileLogger, FileLogger } from "../../src/Util/Console";

test("log an error to the console and the log file", () => {
	expect(ConsoleAndFileLogger.info("Log message")).toBe(ConsoleAndFileLogger);
});

test("log an error to the log file", () => {
	expect(FileLogger.info(inspect(new Error("Error message")))).toBe(FileLogger);
});
