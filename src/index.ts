import type { ClientOptions } from "discord.js";
import { Client, Constants, Options } from "discord.js";
import { config } from "dotenv";
import { assert } from "superstruct";
import { inspect } from "util";
import { GitHubClient } from "./gitHubClient";
import {
	ConsoleAndFileLogger,
	FileLogger,
	ProjectData,
	sString,
	interactionCreate,
	loadCommands,
	logError,
	Numbers,
} from "./Util";

config();

const { GITHUB_TOKEN: token } = process.env;
const { Events, ActivityTypes } = Constants;

const options: ClientOptions = {
	intents: Numbers.intents,
	allowedMentions: { repliedUser: false, parse: [], roles: [], users: [] },
	failIfNotExists: true,
	http: {
		api: "https://canary.discord.com/api",
		version: Numbers.version,
	},
	invalidRequestWarningInterval: Numbers.invalidRequestWarningInterval,
	presence: { activities: [{ name: "with GitHub", type: ActivityTypes.PLAYING }] },
	restGlobalRateLimit: Numbers.restGlobalRateLimit,
	restRequestTimeout: Numbers.restRequestTimeout,
	restTimeOffset: Numbers.restTimeOffset,
	shards: "auto",
	userAgentSuffix: [`@${ProjectData.author}/${ProjectData.name}@v${ProjectData.version}`],
	ws: {
		large_threshold: Numbers.largeThreshold,
	},
	makeCache: Options.cacheWithLimits({
		...Options.defaultMakeCacheSettings,
		BaseGuildEmojiManager: Numbers.cache,
		GuildBanManager: Numbers.cache,
		GuildInviteManager: Numbers.cache,
		GuildMemberManager: Numbers.cache,
		GuildStickerManager: Numbers.cache,
		MessageManager: Numbers.cache,
		PresenceManager: Numbers.cache,
		ReactionManager: Numbers.cache,
		ReactionUserManager: Numbers.cache,
		StageInstanceManager: Numbers.cache,
		ThreadManager: Numbers.cache,
		ThreadMemberManager: Numbers.cache,
		UserManager: Numbers.cache,
		VoiceStateManager: Numbers.cache,
	}),
};

assert(token, sString);

process
	.on("exit", (code) => ConsoleAndFileLogger.error(`Process exited with code ${code}`))
	.on("multipleResolves", (type) => {
		ConsoleAndFileLogger.warn(
			`A promise was ${type}${type === "reject" ? "e" : ""}d more than once!`
		);
	})
	.on("uncaughtException", logError)
	.on("warning", (warn) => {
		console.warn(warn);
		FileLogger.warn(inspect(warn));
	});

const client = new Client(options)
	.on(Events.INTERACTION_CREATE, interactionCreate)
	.on(Events.DEBUG, (message) => {
		ConsoleAndFileLogger.info(message);
	})
	.on(Events.ERROR, logError)
	.on(Events.INVALIDATED, () => process.exit(Numbers.invalidatedExitCode))
	.on(Events.INVALID_REQUEST_WARNING, ({ count, remainingTime }) => {
		const requestsPerMinute =
			count / (Numbers.secondsIn10Minutes / (remainingTime / Numbers.milliseconds));
		ConsoleAndFileLogger.info(`Registered ${requestsPerMinute} requests per minute.`);
		if (requestsPerMinute >= Numbers.maxInvalidRequestsPerMinute)
			process.exit(Numbers.invalidRequestExitCode);
	})
	.on(Events.WARN, (warn) => {
		ConsoleAndFileLogger.warn(warn);
	});

const gitHubClient = new GitHubClient({ token, client });

client.on(Events.CLIENT_READY, async (readyClient) => {
	const results = await Promise.all([
		loadCommands(gitHubClient),
		readyClient.application.fetch(),
	] as const).catch((err) => {
		logError(err);
		return undefined;
	});
	ConsoleAndFileLogger.info(
		`Succesfully logged as ${readyClient.user.tag} with ${results?.[0].size ?? 0} commands.`
	);
});

void gitHubClient.login();
void client.login();
