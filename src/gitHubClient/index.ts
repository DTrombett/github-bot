import type { Client } from "discord.js";
import { Constants } from "discord.js";
import { author, name, version } from "../../package.json";

export const defaultRequestTimeout = 10_000;
const { MESSAGE_CREATE } = Constants.Events;

export class GitHubClient {
	token: string;
	timeZone: string;
	discordClient: Client;
	userAgent: string;
	requestTimeout: number;

	constructor({
		token,
		client,
		timeZone = "Europe/Rome",
		userAgent = `@${author}/${name}@${version}`,
		requestTimeout = defaultRequestTimeout,
	}: {
		token: string;
		client: Client;
		timeZone?: string;
		userAgent?: string;
		requestTimeout?: number;
	}) {
		this.token = token;
		this.timeZone = timeZone;
		this.discordClient = client;
		this.userAgent = userAgent;
		this.requestTimeout = requestTimeout;

		client.on(MESSAGE_CREATE, (message) => {
			message;
		});
	}
}
