import type {
	ActivitiesOptions,
	CacheFactory,
	ClientOptions,
	ClientPresenceStatus,
	HTTPOptions,
	MessageMentionOptions,
	MessageMentionTypes,
	PartialTypes,
	PresenceData,
	PresenceStatusData,
	RateLimitData,
	WebSocketOptions,
	WebSocketProperties,
} from "discord.js";
import { Intents } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import type { Describe } from "superstruct";
import {
	array,
	boolean,
	enums,
	func,
	instance,
	literal,
	number,
	object,
	optional,
	pattern,
	record,
	size,
	string,
	union,
} from "superstruct";

const maxActivityType = 5;

export const sString: Describe<string> = string();
export const sNumber: Describe<number> = number();
export const sBoolean = boolean();

export const sSnowflake = pattern(sString, /\d{16,19}/gu) as unknown as Describe<`${bigint}`>;
export const sMessageMentionTypes: Describe<MessageMentionTypes> = enums([
	"roles",
	"users",
	"everyone",
]);
export const sMessageMentionOptions: Describe<MessageMentionOptions> = object({
	parse: optional(array(sMessageMentionTypes)),
	repliedUser: optional(sBoolean),
	roles: optional(array(sSnowflake) as Describe<string[]>),
	users: optional(array(sSnowflake) as Describe<string[]>),
});
export const sHTTPOptions: Describe<HTTPOptions> = object({
	api: optional(pattern(sString, /http(|s):\/\/.*\./u)),
	cdn: optional(pattern(sString, /http(|s):\/\/.*\./u)),
	headers: optional(record(sString, sString)),
	host: optional(sString),
	invite: optional(pattern(sString, /http(|s):\/\/.*\./u)),
	template: optional(pattern(sString, /http(|s):\/\/.*\./u)),
	version: optional(sNumber),
});
export const sCacheFactory = func() as unknown as Describe<CacheFactory>;
export const sPartialTypes: Describe<PartialTypes> = enums([
	"USER",
	"CHANNEL",
	"GUILD_MEMBER",
	"MESSAGE",
	"REACTION",
]);
export const sActivitiesOptions: Describe<ActivitiesOptions> = object({
	name: optional(sString),
	type: optional(
		union([
			enums(Object.keys(ActivityTypes) as (keyof typeof ActivityTypes)[]),
			size(sNumber, 0, maxActivityType),
		])
	),
	url: optional(sString),
});
export const sClientPresenceStatus: Describe<ClientPresenceStatus> = enums([
	"online",
	"idle",
	"dnd",
]);
export const sPresenceStatusData = union([
	literal("invisible"),
	sClientPresenceStatus,
]) as unknown as Describe<PresenceStatusData>;
export const sPresenceData: Describe<PresenceData> = object({
	activities: optional(array(sActivitiesOptions)),
	afk: optional(sBoolean),
	shardId: optional(union([sNumber, array(sNumber)])),
	status: optional(sPresenceStatusData),
});
export const sWebSocketProperties: Describe<WebSocketProperties> = object({
	$browser: optional(sString),
	$device: optional(sString),
	$os: optional(sString),
});
export const sWebSocketOptions: Describe<WebSocketOptions> = object({
	compress: optional(sBoolean),
	large_threshold: optional(sNumber),
	properties: optional(sWebSocketProperties),
});
export const sIntentsResolvable = union([
	instance(Intents),
	enums([
		"GUILDS",
		"GUILD_MEMBERS",
		"GUILD_BANS",
		"GUILD_EMOJIS_AND_STICKERS",
		"GUILD_INTEGRATIONS",
		"GUILD_WEBHOOKS",
		"GUILD_INVITES",
		"GUILD_VOICE_STATES",
		"GUILD_PRESENCES",
		"GUILD_MESSAGES",
		"GUILD_MESSAGE_REACTIONS",
		"GUILD_MESSAGE_TYPING",
		"DIRECT_MESSAGES",
		"DIRECT_MESSAGE_REACTIONS",
		"DIRECT_MESSAGE_TYPING",
	] as const),
	sSnowflake,
]) as Describe<ClientOptions["intents"]>;
export const sClientOptions: Describe<ClientOptions> = object({
	intents: union([sIntentsResolvable, array(sIntentsResolvable)]),
	allowedMentions: optional(sMessageMentionOptions),
	failIfNotExists: optional(sBoolean),
	http: optional(sHTTPOptions),
	invalidRequestWarningInterval: optional(sNumber),
	makeCache: optional(sCacheFactory),
	partials: optional(array(sPartialTypes)),
	presence: optional(sPresenceData),
	rejectOnRateLimit: optional(
		union([
			array(sString),
			func() as unknown as Describe<(data: RateLimitData) => Promise<boolean> | boolean>,
		])
	),
	restGlobalRateLimit: optional(sNumber),
	restRequestTimeout: optional(sNumber),
	restSweepInterval: optional(sNumber),
	restTimeOffset: optional(sNumber),
	restWsBridgeTimeout: optional(sNumber),
	retryLimit: optional(sNumber),
	shardCount: optional(sNumber),
	shards: optional(union([sNumber, array(sNumber), literal("auto")])),
	userAgentSuffix: optional(array(sString)),
	ws: optional(sWebSocketOptions),
});
