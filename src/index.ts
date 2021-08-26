import type { ClientOptions, GuildMember } from "discord.js";
import { Client, Constants, Options } from "discord.js";
import { config } from "dotenv";
import { assert } from "superstruct";
import { inspect } from "util";
import { GitHubClient } from "./gitHubClient";
import {
	ConsoleAndFileLogger,
	FileLogger,
	IntentsFlags,
	ProjectData,
	sClientOptions,
	sString,
	interactionCreate,
} from "./Util";

config();

const { GITHUB_TOKEN: token } = process.env;
const { Events, ActivityTypes } = Constants;

// Numbers
const invalidRequestWarningInterval = 1_000;
const restGlobalRateLimit = 50;
const restRequestTimeout = 10_000;
const restTimeOffset = 1_000;
const invalidatedExitCode = 502;
const maxInvalidRequestsPerMinute = 1_000;
const invalidRequestExitCode = 508;
const secondsIn10Minutes = 600;
const milliseconds = 1_000;
const seconds = 60;
const sweepMinutes = 60;

const options: ClientOptions = {
	intents: (1 << IntentsFlags.GUILDS) | (1 << IntentsFlags.GUILD_MESSAGES),
	allowedMentions: { parse: ["everyone"] },
	failIfNotExists: false,
	http: {
		api: "https://canary.discord.com/api",
	},
	invalidRequestWarningInterval,
	presence: { activities: [{ name: "With GitHub", type: ActivityTypes.PLAYING }] },
	restGlobalRateLimit,
	restRequestTimeout,
	restTimeOffset,
	shards: "auto",
	userAgentSuffix: [`@${ProjectData.author}/${ProjectData.name}@v${ProjectData.version}`],
	ws: {
		large_threshold: 0,
	},
	makeCache: Options.cacheWithLimits({
		...Options.defaultMakeCacheSettings,
		BaseGuildEmojiManager: 0,
		GuildBanManager: 0,
		GuildInviteManager: 0,
		GuildMemberManager: {
			maxSize: 1,
			sweepInterval: seconds * sweepMinutes,
			sweepFilter: () => (member: GuildMember) => member.id !== member.client.user?.id,
			keepOverLimit: (member) => member.id === member.client.user?.id,
		} as const,
		GuildStickerManager: 0,
		PresenceManager: 0,
		ReactionManager: 0,
		ReactionUserManager: 0,
		StageInstanceManager: 0,
		UserManager: 1000,
		VoiceStateManager: 0,
		MessageManager: 0,
		ThreadMemberManager: 0,
	}),
	rejectOnRateLimit: ({ global, limit, method, path, route, timeout }) => {
		ConsoleAndFileLogger.warn(
			`Discord ${method} request queued on ${route} for ${
				global ? "global" : "route"
			} ratelimit.\nLimit of ${limit} requests reached for ${timeout}ms on path ${path}.`
		);
		return false;
	},
};

assert(token, sString);
assert(options, sClientOptions);

process
	.on("exit", (code) => ConsoleAndFileLogger.error(`Process exited with code ${code}`))
	.on("multipleResolves", (type) => {
		ConsoleAndFileLogger.warn(
			`A promise was ${type}${type === "reject" ? "e" : ""}d more than once!`
		);
	})
	.on("uncaughtException", (err) => {
		console.error(err);
		FileLogger.error(err);
	})
	.on("warning", (warn) => {
		console.warn(warn);
		FileLogger.warn(inspect(warn));
	});

const client = new Client(options)
	.on(Events.INTERACTION_CREATE, interactionCreate)
	.on(Events.CLIENT_READY, (readyClient) => {
		ConsoleAndFileLogger.info(
			`Succesfully logged as ${client.user?.tag ?? "Unknown User"} in ${
				readyClient.guilds.cache.size
			} guilds.`
		);
	})
	.on(Events.DEBUG, (message) => {
		ConsoleAndFileLogger.info(message);
	})
	.on(Events.ERROR, (error) => {
		console.error(error);
		FileLogger.error(inspect(error));
	})
	.on(Events.GUILD_CREATE, (guild) => {
		ConsoleAndFileLogger.info("Joined a new guild!");
		console.info(guild);
	})
	.on(Events.GUILD_DELETE, (guild) => {
		ConsoleAndFileLogger.info("Left a guild!");
		console.info(guild);
		FileLogger.info(inspect(guild, { compact: false }));
	})
	.on(Events.INVALIDATED, () => process.exit(invalidatedExitCode))
	.on(Events.INVALID_REQUEST_WARNING, ({ count, remainingTime }) => {
		const requestsPerMinute = count / (secondsIn10Minutes / (remainingTime / milliseconds));
		ConsoleAndFileLogger.info(`Registered ${requestsPerMinute} requests per minute.`);
		if (requestsPerMinute >= maxInvalidRequestsPerMinute) process.exit(invalidRequestExitCode);
	})
	.on(Events.WARN, (warn) => {
		ConsoleAndFileLogger.warn(warn);
	})
	.on(Events.SHARD_DISCONNECT, (event, shard) => {
		ConsoleAndFileLogger.error(`Shard ${shard} disconnected for an error!`);
		console.error(event);
		FileLogger.error(inspect(event));
	})
	.on(Events.SHARD_RECONNECTING, (shard) => {
		ConsoleAndFileLogger.info(`Shard ${shard} is reconnecting...`);
	})
	.on(Events.SHARD_RESUME, (shard, events) => {
		ConsoleAndFileLogger.info(`Shard ${shard} resumed! Replayed ${events} events.`);
	});

const gitHubClient = new GitHubClient({ token, client }).on("rateLimit", (data) => {
	console.error(data);
	FileLogger.error(inspect(data));
});

gitHubClient.login().then(console.log).catch(console.error);

void client.login();
