import { inspect } from "util";
import { FileLogger } from "./Console";

export const logError = (err: unknown): void => {
	console.error(err);
	FileLogger.error(inspect(err));
};

export const errorMessage = (err: unknown): string => {
	if (err instanceof Error) return err.message;
	logError(err);
	return "Unknown error";
};

export default logError;
