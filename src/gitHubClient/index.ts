import type { Client } from "discord.js";
import { Constants } from "discord.js";
import { assert } from "superstruct";
import type { GitHubClientOptions } from "../Util";
import { GithubAuthorData, ProjectData, sGitHubClientOptions } from "../Util";

export const defaultRequestTimeout = 10_000;

const { MESSAGE_CREATE } = Constants.Events;

export class GitHubClient {
	token: string;
	timeZone: string;
	discordClient: Client;
	userAgent: string;
	requestTimeout: number;

	constructor(options: GitHubClientOptions) {
		assert(options, sGitHubClientOptions);
		const {
			token,
			client,
			timeZone = "Europe/Rome",
			userAgent = `@${ProjectData.author}/${ProjectData.name}@${ProjectData.version}`,
			requestTimeout = defaultRequestTimeout,
		} = options;
		this.token = token;
		this.timeZone = timeZone;
		this.discordClient = client;
		this.userAgent = userAgent;
		this.requestTimeout = requestTimeout;

		client.on(MESSAGE_CREATE, (message) => {
			const {
				author: { avatar, username },
				embeds,
			} = message;
			if (
				embeds.length === 0 ||
				avatar !== GithubAuthorData.avatar ||
				username !== GithubAuthorData.username
			)
				return;
			console.log(message.embeds[0]);
		});
	}
}
