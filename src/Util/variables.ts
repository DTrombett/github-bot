import { promises } from "fs";
import { join } from "path";
import { assert } from "superstruct";
import { sString } from ".";

const { readFile, writeFile } = promises;

export type Json = Json[] | boolean | number | string | { [property: string]: Json } | null;

/**
 * Import a variable.
 * @param name - The variable name
 */
export const getVar = (name: string): Promise<Json> => {
	assert(name, sString);
	return readFile(join(__dirname, "../..", "variables", `${name}.json`), "utf8").then(
		(json) => JSON.parse(json) as Json
	);
};

/**
 * Set the value of a single variable.
 * @param name - The variable name
 * @param value - The value to set
 */
export const setVar = <V extends Json>(name: string, value: V): Promise<void> => {
	assert(name, sString);
	return writeFile(join(__dirname, "../..", "variables", `${name}.json`), JSON.stringify(value));
};

export default getVar;
