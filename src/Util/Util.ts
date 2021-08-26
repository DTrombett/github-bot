import type { Client, Message } from "discord.js";
import type { Json } from ".";
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

export type GitHubEvents = {
	message: [message: Message];
	rateLimit: [rateLimitData: RateLimitError];
};

// eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
export type APIRouter = {
	[K in symbol | "constructor" | "inspect" | "toString" | "valueOf"]: () => string;
} & {
	[key: string]: APIRouter;
	(...routers: string[]): APIRouter;
} & {
		[K in Lowercase<RequestMethod>]: (
			options?: Omit<RequestOptions, K extends "delete" | "get" | "head" ? "data" : never>
		) => Promise<unknown>;
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
	onlyIf?: {
		match?: string | null;
		notMatch?: string | null;
		modifiedSince?: string | null;
		notModifiedSince?: string | null;
	};
	retry?: boolean;
};
export type RequestMethod = "DELETE" | "GET" | "HEAD" | "PATCH" | "POST" | "PUT";
export enum ConditionalHeaders {
	match = "If-Match",
	notMatch = "If-None-Match",
	modifiedSince = "If-Modified-Since",
	notModifiedSince = "If-Unmodified-Since",
}

export type RateLimitData = {
	timeout: number;
	limit: number;
	method: string;
	path: string;
};
