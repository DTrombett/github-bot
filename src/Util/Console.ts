import { createLogger, format, transports } from "winston";
import type { Log } from ".";

/**
 * A logger to the console and the log file
 */
export const ConsoleAndFileLogger: Log = createLogger({
	transports: [new transports.Console(), new transports.File({ filename: "logs.log" })],
	format: format.printf(
		(logInfo) =>
			`[${logInfo.level.toUpperCase()}] - ${logInfo.message} (${new Date().toLocaleString()})`
	),
	level: "silly",
});

/**
 * A logger to only the log file
 */
export const FileLogger: Log = createLogger({
	transports: new transports.File({ filename: "logs.log" }),
	level: "silly",
});

export default ConsoleAndFileLogger;
