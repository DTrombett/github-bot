import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { createLogger, format, transports } from "winston";

const now = Date.now();
const path = join(__dirname, `../../logs`);
const filePath = join(path, `${now}.log`);

rmSync(path, { recursive: true, force: true });
mkdirSync(path);
writeFileSync(filePath, "");

export const ConsoleAndFileLogger = createLogger({
	transports: [new transports.Console(), new transports.File({ filename: filePath })],
	format: format.printf(
		(logInfo) =>
			`[${logInfo.level.toUpperCase()}] - ${
				logInfo.message
			} (${new Date().toLocaleString()} - RAM: ${
				Math.round((process.memoryUsage().heapUsed * 25) / 262144) / 100
			}MB)`
	),
	level: "silly",
});
export const FileLogger = createLogger({
	transports: new transports.File({ filename: filePath }),
	level: "silly",
});

export default ConsoleAndFileLogger;
