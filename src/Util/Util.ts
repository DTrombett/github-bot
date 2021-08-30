import type { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import type { Awaited, Client, CommandInteraction, InteractionReplyOptions } from "discord.js";
import type { Command, Json } from ".";
import type RateLimitError from "../gitHubClient/rest/RateLimitError";

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

export type GitHubEvents = {
	rateLimit: [rateLimitData: RateLimitError];
};

// eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
export type APIRouter = {
	[K in symbol | "constructor" | "inspect" | "toString" | "valueOf"]: () => string;
} & {
	[key: string]: APIRouter;
	(...routers: string[]): APIRouter;
} & {
		[K in Lowercase<RequestMethod>]: <T = unknown>(
			options?: Omit<RequestOptions, K extends "delete" | "get" | "head" ? "data" : never>
		) => Promise<T | null>;
	};

export type AcceptType =
	| ""
	| "base64"
	| "diff"
	| "full"
	| "html"
	| "patch"
	| "raw"
	| "sha"
	| "text";
export type RequestOptions = {
	headers?: Record<string, string>;
	data?: Json;
	query?: Record<string, string[] | string | null | undefined>;
	requestTimeout?: number;
	acceptType?: AcceptType;
	json?: boolean;
	retry?: boolean;
};
export type RequestMethod = "DELETE" | "GET" | "HEAD" | "PATCH" | "POST" | "PUT";

export type RateLimitData = {
	timeout: number;
	limit: number;
	method: string;
	path: string;
};

export type CommandOptions = {
	data:
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder;
	run: (
		this: Command,
		interaction: CommandInteraction
	) => Awaited<void> | InteractionReplyOptions | string;
	ownerOnly?: boolean;
};

export enum UserType {
	"User" = 1,
	"Organization" = 2,
}

export type UserPlan = {
	name: string;
	space: number;
	privateRepositoryCount: number;
	collaboratorsCount: number;
};

export type ClientUserData = UserData & {
	private_gists?: number;
	total_private_repos?: number;
	owned_private_repos?: number;
	disk_usage?: number;
	collaborators?: number;
	two_factor_authentication?: boolean;
	plan?: {
		name: string;
		space: number;
		private_repos: number;
		collaborators: number;
	};
};
export type UserData = {
	avatar_url?: `https://avatars.githubusercontent.com/u/${string}?v=4`;
	bio?: string | null;
	blog?: string;
	company?: string | null;
	created_at?: string;
	email?: string | null;
	events_url?: `https://api.github.com/users/${string}/events{/privacy}`;
	followers_url?: `https://api.github.com/users/${string}/followers`;
	followers?: number;
	following_url?: `https://api.github.com/users/${string}/following{/other_user}`;
	following?: number;
	gists_url?: `https://api.github.com/users/${string}/gists{/gist_id}`;
	gravatar_id?: string;
	hireable?: boolean;
	html_url?: `https://github.com/users/${string}`;
	id?: number;
	location?: string | null;
	login: string;
	name?: string | null;
	node_id?: string;
	organizations_url?: `https://api.github.com/users/${string}/orgs`;
	public_gists?: number;
	public_repos?: number;
	received_events_url?: `https://api.github.com/users/${string}/received_events`;
	repos_url?: `https://api.github.com/users/${string}/repos`;
	site_admin?: boolean;
	starred_url?: `https://api.github.com/users/${string}/starred{/owner}{/repo}`;
	subscriptions_url?: `https://api.github.com/users/${string}/subscriptions`;
	twitter_username?: string | null;
	type?: "Organization" | "User";
	updated_at?: string;
	url?: `https://api.github.com/users/${string}`;
};
