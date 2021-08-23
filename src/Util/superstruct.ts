import type {
	APIGuildWelcomeScreen,
	APIGuildWelcomeScreenChannel,
	APIPartialChannel,
	APIPartialGuild,
	APIUser,
	APIWebhook,
	ChannelType,
	GuildFeature,
	GuildVerificationLevel,
	Snowflake,
	UserFlags,
	UserPremiumType,
	WebhookType,
} from "discord-api-types";
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
	nullable,
	number,
	object,
	optional,
	pattern,
	record,
	size,
	string,
	union,
} from "superstruct";

const activityType = 5;
const webhookType = 3;
const channelType1 = 6;
const channelType2 = 10;
const channelType3 = 13;
const guildName = 100;
const userPremiumType = 2;

export const sString: Describe<string> = string();
export const sNumber: Describe<number> = number();
export const sBoolean = boolean();

export const sSnowflake: Describe<Snowflake> = pattern(sString, /\d{16,19}/gu);
export const sMessageMentionTypes: Describe<MessageMentionTypes> = enums([
	"roles",
	"users",
	"everyone",
]);
export const sMessageMentionOptions: Describe<MessageMentionOptions> = object({
	parse: optional(array(sMessageMentionTypes)),
	repliedUser: optional(sBoolean),
	roles: optional(array(sSnowflake)),
	users: optional(array(sSnowflake)),
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
			size(sNumber, 0, activityType),
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

export const sWebhookType: Describe<WebhookType> = size(sNumber, 1, webhookType);
export const sChannelType: Describe<ChannelType> = union([
	size(sNumber, 0, channelType1),
	size(sNumber, channelType2, channelType3),
]);
export const sAPIPartialChannel: Describe<APIPartialChannel> = object({
	id: sSnowflake,
	type: sChannelType,
	name: optional(sString),
});
export const sGuildFeature = enums([
	"ANIMATED_ICON",
	"BANNER",
	"COMMERCE",
	"COMMUNITY",
	"DISCOVERABLE",
	"FEATURABLE",
	"INVITE_SPLASH",
	"NEWS",
	"PARTNERED",
	"RELAY_ENABLED",
	"VANITY_URL",
	"VERIFIED",
	"VIP_REGIONS",
	"WELCOME_SCREEN_ENABLED",
	"MEMBER_VERIFICATION_GATE_ENABLED",
	"PREVIEW_ENABLED",
	"TICKETED_EVENTS_ENABLED",
	"MONETIZATION_ENABLED",
	"MORE_STICKERS",
	"THREE_DAY_THREAD_ARCHIVE",
	"SEVEN_DAY_THREAD_ARCHIVE",
	"PRIVATE_THREADS",
]) as Describe<GuildFeature>;
const guildVerificationLevel = 4;
export const sGuildVerificationLevel: Describe<GuildVerificationLevel> = size(
	sNumber,
	0,
	guildVerificationLevel
);
export const sAPIGuildWelcomeScreenChannel: Describe<APIGuildWelcomeScreenChannel> = object({
	channel_id: sSnowflake,
	description: sString,
	emoji_id: nullable(sSnowflake),
	emoji_name: nullable(sString),
});
export const sAPIGuildWelcomeScreen: Describe<APIGuildWelcomeScreen> = object({
	description: nullable(sString),
	welcome_channels: array(sAPIGuildWelcomeScreenChannel),
});
export const sAPIPartialGuild: Describe<APIPartialGuild> = object({
	icon: nullable(sString),
	id: sSnowflake,
	name: size(sString, 1, guildName),
	splash: nullable(sString),
	banner: optional(nullable(sString)),
	description: optional(nullable(sString)),
	features: optional(array(sGuildFeature)),
	unavailable: optional(sBoolean),
	vanity_url_code: optional(nullable(sString)),
	verification_level: optional(sGuildVerificationLevel),
	welcome_screen: optional(sAPIGuildWelcomeScreen),
});
export const sUserFlags = enums([
	// eslint-disable-next-line no-magic-numbers
	1, 2, 4, 8, 64, 128, 256, 512, 1024, 16384, 65536, 131072, 262144,
]) as unknown as Describe<UserFlags>;
export const sUserPremiumType: Describe<UserPremiumType> = size(sNumber, 0, userPremiumType);
export const sAPIUser: Describe<APIUser> = object({
	avatar: nullable(sString),
	discriminator: sString,
	id: sSnowflake,
	username: sString,
	bot: optional(sBoolean),
	email: optional(nullable(sString)),
	flags: optional(sUserFlags),
	locale: optional(sString),
	mfa_enabled: optional(sBoolean),
	premium_type: optional(sUserPremiumType),
	public_flags: optional(sUserFlags),
	system: optional(sBoolean),
	verified: optional(sBoolean),
});
export const sAPIWebhook: Describe<APIWebhook> = object({
	application_id: nullable(sSnowflake),
	avatar: nullable(sString),
	channel_id: sSnowflake,
	id: sSnowflake,
	name: nullable(sString),
	type: sWebhookType,
	guild_id: optional(sSnowflake),
	source_channel: optional(sAPIPartialChannel),
	source_guild: optional(sAPIPartialGuild),
	token: optional(sString),
	url: optional(sString),
	user: optional(sAPIUser),
});

export const sSnowflakeArray: Describe<Snowflake[]> = array(sSnowflake());
