import { inspect } from "util";
import { FileLogger } from "./Console";

/**
 * Log an error to the console and the log file.
 * @param err - The error to log
 */
export const logError = (err: unknown): void => {
	console.error(err);
	FileLogger.error(inspect(err));
};

/**
 * Get the error message from an error object.
 * @param err - The error received
 * @returns The error message, or `"Unknown error"` if no message was present
 */
export const errorMessage = (err: unknown): string => {
	if (err instanceof Error) return err.message;
	logError(err);
	return "Unknown error";
};

export default logError;
