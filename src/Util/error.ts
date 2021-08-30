import { inspect } from "util";
import { FileLogger } from "./Console";

export const logError = (err: unknown): void => {
	console.error(err);
	FileLogger.error(inspect(err));
};
