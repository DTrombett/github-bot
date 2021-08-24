import type { Client } from "discord.js";
import { Constants } from "discord.js";
import EventEmitter from "events";
import { assert } from "superstruct";
import type { GitHubClientOptions } from "../Util";
import { GithubAuthorData, ProjectData, sGitHubClientOptions } from "../Util";

export const defaultRequestTimeout = 10_000;

const { MESSAGE_CREATE } = Constants.Events;

export class GitHubClient extends EventEmitter {
	token: string;
	timeZone: string;
	discordClient: Client;
	userAgent: string;
	requestTimeout: number;

	constructor(options: GitHubClientOptions) {
		assert(options, sGitHubClientOptions);
		super();

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
	}

	login(): this {
		this.discordClient.on(MESSAGE_CREATE, (message) => {
			const {
				author: { avatar, username },
				embeds,
			} = message;
			if (
				avatar !== GithubAuthorData.avatar ||
				embeds.length === 0 ||
				username !== GithubAuthorData.username
			)
				return;
			console.log(
				// eslint-disable-next-line no-magic-numbers
				`Ram usage: ${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100}MB`
			);
		});
		return this;
	}
}
