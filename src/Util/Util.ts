import type { Client } from "discord.js";

export const enum IntentsFlags {
	GUILDS,
	GUILD_MEMBERS,
	GUILD_BANS,
	GUILD_EMOJIS_AND_STICKERS,
	GUILD_INTEGRATIONS,
	GUILD_WEBHOOKS,
	GUILD_INVITES,
	GUILD_VOICE_STATES,
	GUILD_PRESENCES,
	GUILD_MESSAGES,
	GUILD_MESSAGE_REACTIONS,
	GUILD_MESSAGE_TYPING,
	DIRECT_MESSAGES,
	DIRECT_MESSAGE_REACTIONS,
	DIRECT_MESSAGE_TYPING,
}

export const enum GithubAuthorData {
	username = "GitHub",
	avatar = "df91181b3f1cf0ef1592fbe18e0962d7",
}

export type GitHubClientOptions = {
	token: string;
	client: Client;
	timeZone?: string;
	userAgent?: string;
	requestTimeout?: number;
};

export const enum ProjectData {
	author = "DTrombett",
	name = "github-bot",
	version = "0.0.1",
	description = "A Discord bot that interacts with Github API.",
}
