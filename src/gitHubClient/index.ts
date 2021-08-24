import type { Awaited, Client } from "discord.js";
import { Constants } from "discord.js";
import EventEmitter from "events";
import { assert } from "superstruct";
import type { GitHubClientOptions, GitHubEvents } from "../Util";
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
			this.emit("message", message);
		});
		return this;
	}

	override on<E extends keyof GitHubEvents>(
		event: E,
		listener: (...args: GitHubEvents[E]) => Awaited<void>
	): this {
		return super.on(event, listener as (...args: any[]) => void);
	}
}
