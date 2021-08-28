import { SlashCommandBuilder } from "@discordjs/builders";
import type { Snowflake } from "discord-api-types";
import type {
	ActivitiesOptions,
	CacheFactory,
	ClientOptions,
	ClientPresenceStatus,
	EmojiIdentifierResolvable,
	EmojiResolvable,
	HTTPOptions,
	InteractionButtonOptions,
	InteractionReplyOptions,
	LinkButtonOptions,
	MessageActionRowComponent,
	MessageActionRowComponentOptions,
	MessageActionRowComponentResolvable,
	MessageActionRowOptions,
	MessageButtonOptions,
	MessageButtonStyle,
	MessageButtonStyleResolvable,
	MessageComponentType,
	MessageMentionOptions,
	MessageMentionTypes,
	MessageSelectMenuOptions,
	MessageSelectOptionData,
	PartialTypes,
	PresenceData,
	PresenceStatusData,
	RateLimitData,
	WebSocketOptions,
	WebSocketProperties,
} from "discord.js";
import {
	Client,
	GuildEmoji,
	Intents,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
	ReactionEmoji,
} from "discord.js";
import type {
	ActivityTypes,
	MessageButtonStyles,
	MessageComponentTypes,
} from "discord.js/typings/enums";
import type { Describe } from "superstruct";
import {
	any,
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
import type {
	AcceptType,
	CommandOptions,
	GitHubClientOptions,
	Json,
	RateLimitData as RateLimit,
	RequestMethod,
	RequestOptions,
} from ".";
import type { DetailedError, ErrorCode, ErrorData } from "../gitHubClient/rest/GitHubAPIError";

const activityType = 5;
const messageComponentType = 3;
const messageButtonStyle = 5;
// const webhookType = 3;
// const channelType1 = 6;
// const channelType2 = 10;
// const channelType3 = 13;
// const guildName = 100;
// const userPremiumType = 2;

export const sString: Describe<string> = string();
export const sNumber: Describe<number> = number();
export const sBoolean = boolean();

export const sSnowflake: Describe<Snowflake> = pattern(sString, /^\d{17,19}$/);
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
			size(sNumber, 0, activityType),
			enums([
				"PLAYING",
				"STREAMING",
				"LISTENING",
				"WATCHING",
				"CUSTOM",
				"COMPETING",
			] as (keyof typeof ActivityTypes)[]),
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
	sNumber,
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
export const sMessageComponentTypes: Describe<MessageComponentTypes> = size(
	sNumber,
	1,
	messageComponentType
);
export const sMessageComponentType: Describe<MessageComponentType> = enums([
	"ACTION_ROW",
	"BUTTON",
	"SELECT_MENU",
]);
export const sMessageActionRowComponent = union([
	instance(MessageButton),
	instance(MessageSelectMenu),
]) as unknown as Describe<MessageActionRowComponent>;
export const sEmojiResolvable: Describe<EmojiResolvable> = union([
	sSnowflake,
	instance(GuildEmoji),
	instance(ReactionEmoji),
]);
export const sEmojiIdentifierResolvable: Describe<EmojiIdentifierResolvable> = union([
	sString,
	sEmojiResolvable,
]);
export const sMessageButtonStyle: Describe<MessageButtonStyle> = enums([
	"PRIMARY",
	"SECONDARY",
	"SUCCESS",
	"DANGER",
	"LINK",
]);

export const sMessageButtonStyles: Describe<MessageButtonStyles> = size(
	sNumber,
	1,
	messageButtonStyle
);
export const sMessageButtonStyleResolvable: Describe<MessageButtonStyleResolvable> = union([
	sMessageButtonStyle,
	sMessageButtonStyles,
]);
export const sInteractionButtonOptions: Describe<InteractionButtonOptions> = object({
	type: optional(union([sMessageComponentType, sMessageComponentTypes])),
	customId: sString,
	disabled: optional(sBoolean),
	emoji: optional(sEmojiIdentifierResolvable),
	label: optional(sString),
	style: union([
		enums(["PRIMARY", "SECONDARY", "SUCCESS", "DANGER"]),
		size(sNumber, 1, messageButtonStyle - 1),
	]) as Describe<InteractionButtonOptions["style"]>,
	url: optional(sString),
});
export const sLinkButtonOptions: Describe<LinkButtonOptions> = object({
	style: union([literal("LINK"), literal(messageButtonStyle)]),
	url: sString,
	disabled: optional(sBoolean),
	emoji: optional(sEmojiIdentifierResolvable),
	label: optional(sString),
	type: optional(union([sMessageComponentType, sMessageComponentTypes])),
});
export const sMessageButtonOptions = union([
	sInteractionButtonOptions,
	sLinkButtonOptions,
]) as unknown as Describe<MessageButtonOptions>;
export const sMessageSelectOptionData: Describe<MessageSelectOptionData> = object({
	default: optional(sBoolean),
	description: optional(sString),
	emoji: optional(sEmojiIdentifierResolvable),
	label: sString,
	value: sString,
});
export const sMessageSelectMenuOptions: Describe<MessageSelectMenuOptions> = object({
	type: optional(union([sMessageComponentType, sMessageComponentTypes])),
	customId: optional(sString),
	disabled: optional(sBoolean),
	maxValues: optional(sNumber),
	minValues: optional(sNumber),
	placeholder: optional(sString),
	options: optional(array(sMessageSelectOptionData)),
});
export const sMessageActionRowComponentOptions = union([
	sMessageButtonOptions,
	sMessageSelectMenuOptions,
]) as unknown as Describe<MessageActionRowComponentOptions>;
export const sMessageActionRowComponentResolvable = union([
	sMessageActionRowComponent,
	sMessageActionRowComponentOptions,
]) as unknown as Describe<MessageActionRowComponentResolvable>;
export const sMessageActionRowOptions: Describe<MessageActionRowOptions> = object({
	type: optional(union([sMessageComponentType, sMessageComponentTypes])),
	components: array(sMessageActionRowComponentResolvable),
});
export const sInteractionReplyOptions: Describe<InteractionReplyOptions> = object({
	allowedMentions: optional(sMessageMentionOptions),
	components: optional(array(union([instance(MessageActionRow), sMessageActionRowOptions]))),
});

export const sGitHubClientOptions: Describe<GitHubClientOptions> = object({
	client: instance(Client) as unknown as Describe<Client>,
	token: sString,
	requestTimeout: optional(sNumber),
	timeZone: optional(sString),
	userAgent: optional(sString),
});

export const sRequestMethod: Describe<RequestMethod> = enums([
	"DELETE",
	"GET",
	"HEAD",
	"PATCH",
	"POST",
	"PUT",
]);
export const sLowercaseRequestMethod: Describe<Lowercase<RequestMethod>> = enums([
	"delete",
	"get",
	"head",
	"patch",
	"post",
	"put",
]);
export const sAcceptType: Describe<AcceptType> = enums([
	"",
	"base64",
	"diff",
	"full",
	"html",
	"patch",
	"raw",
	"sha",
	"text",
]);
export const sJson: Describe<Json> = nullable(
	union([sString, sNumber, record(sString, any()), array(any()), sBoolean])
);
export const sRequestOptions: Describe<RequestOptions> = object({
	acceptType: optional(sAcceptType),
	data: optional(sJson),
	headers: optional(record(sString, sString)),
	json: optional(sBoolean),
	onlyIf: optional(
		object({
			match: optional(nullable(sString)),
			notMatch: optional(nullable(sString)),
			modifiedSince: optional(nullable(sString)),
			notModifiedSince: optional(nullable(sString)),
		})
	),
	query: optional(record(sString, optional(nullable(union([sString, array(sString)]))))),
	requestTimeout: optional(sNumber),
});
export const sDetailedError = union([
	object({
		message: sString,
		documentation_url: optional(sString),
		resource: sString,
		field: sString,
		code: literal("custom"),
	}),
	object({
		resource: sString,
		field: sString,
		code: enums([
			"already_exists",
			"invalid",
			"missing_field",
			"missing",
			"unprocessable",
		] as ErrorCode[]),
		documentation_url: optional(sString),
	}),
]) as unknown as Describe<DetailedError>;
export const sErrorData: Describe<ErrorData> = object({
	message: sString,
	errors: optional(array(sDetailedError)),
	documentation_url: optional(sString),
});
export const sRateLimitData: Describe<RateLimit> = object({
	limit: sNumber,
	method: sString,
	path: sString,
	timeout: sNumber,
});

export const sCommandOptions: Describe<CommandOptions> = object({
	data: instance(SlashCommandBuilder) as unknown as Describe<CommandOptions["data"]>,
	run: func() as unknown as Describe<CommandOptions["run"]>,
	reload: optional(sBoolean),
});

// export const sWebhookType: Describe<WebhookType> = size(sNumber, 1, webhookType);
// export const sChannelType: Describe<ChannelType> = union([
// 	size(sNumber, 0, channelType1),
// 	size(sNumber, channelType2, channelType3),
// ]);
// export const sAPIPartialChannel: Describe<APIPartialChannel> = object({
// 	id: sSnowflake,
// 	type: sChannelType,
// 	name: optional(sString),
// });
// export const sGuildFeature = enums([
// 	"ANIMATED_ICON",
// 	"BANNER",
// 	"COMMERCE",
// 	"COMMUNITY",
// 	"DISCOVERABLE",
// 	"FEATURABLE",
// 	"INVITE_SPLASH",
// 	"NEWS",
// 	"PARTNERED",
// 	"RELAY_ENABLED",
// 	"VANITY_URL",
// 	"VERIFIED",
// 	"VIP_REGIONS",
// 	"WELCOME_SCREEN_ENABLED",
// 	"MEMBER_VERIFICATION_GATE_ENABLED",
// 	"PREVIEW_ENABLED",
// 	"TICKETED_EVENTS_ENABLED",
// 	"MONETIZATION_ENABLED",
// 	"MORE_STICKERS",
// 	"THREE_DAY_THREAD_ARCHIVE",
// 	"SEVEN_DAY_THREAD_ARCHIVE",
// 	"PRIVATE_THREADS",
// ]) as Describe<GuildFeature>;
// const guildVerificationLevel = 4;
// export const sGuildVerificationLevel: Describe<GuildVerificationLevel> = size(
// 	sNumber,
// 	0,
// 	guildVerificationLevel
// );
// export const sAPIGuildWelcomeScreenChannel: Describe<APIGuildWelcomeScreenChannel> = object({
// 	channel_id: sSnowflake,
// 	description: sString,
// 	emoji_id: nullable(sSnowflake),
// 	emoji_name: nullable(sString),
// });
// export const sAPIGuildWelcomeScreen: Describe<APIGuildWelcomeScreen> = object({
// 	description: nullable(sString),
// 	welcome_channels: array(sAPIGuildWelcomeScreenChannel),
// });
// export const sAPIPartialGuild: Describe<APIPartialGuild> = object({
// 	icon: nullable(sString),
// 	id: sSnowflake,
// 	name: size(sString, 1, guildName),
// 	splash: nullable(sString),
// 	banner: optional(nullable(sString)),
// 	description: optional(nullable(sString)),
// 	features: optional(array(sGuildFeature)),
// 	unavailable: optional(sBoolean),
// 	vanity_url_code: optional(nullable(sString)),
// 	verification_level: optional(sGuildVerificationLevel),
// 	welcome_screen: optional(sAPIGuildWelcomeScreen),
// });
// export const sUserFlags = enums([
// 	// eslint-disable-next-line no-magic-numbers
// 	1, 2, 4, 8, 64, 128, 256, 512, 1024, 16384, 65536, 131072, 262144,
// ]) as unknown as Describe<UserFlags>;
// export const sUserPremiumType: Describe<UserPremiumType> = size(sNumber, 0, userPremiumType);
// export const sAPIUser: Describe<APIUser> = object({
// 	avatar: nullable(sString),
// 	discriminator: sString,
// 	id: sSnowflake,
// 	username: sString,
// 	bot: optional(sBoolean),
// 	email: optional(nullable(sString)),
// 	flags: optional(sUserFlags),
// 	locale: optional(sString),
// 	mfa_enabled: optional(sBoolean),
// 	premium_type: optional(sUserPremiumType),
// 	public_flags: optional(sUserFlags),
// 	system: optional(sBoolean),
// 	verified: optional(sBoolean),
// });
// export const sAPIWebhook: Describe<APIWebhook> = object({
// 	application_id: nullable(sSnowflake),
// 	avatar: nullable(sString),
// 	channel_id: sSnowflake,
// 	id: sSnowflake,
// 	name: nullable(sString),
// 	type: sWebhookType,
// 	guild_id: optional(sSnowflake),
// 	source_channel: optional(sAPIPartialChannel),
// 	source_guild: optional(sAPIPartialGuild),
// 	token: optional(sString),
// 	url: optional(sString),
// 	user: optional(sAPIUser),
// });
