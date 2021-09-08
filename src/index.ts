/* istanbul ignore file */
import type { ClientOptions } from "discord.js";
import { Client, Constants, Options } from "discord.js";
import { config } from "dotenv";
import { join } from "path";
import { assert, string } from "superstruct";
import { inspect } from "util";
import { GitHubClient } from "./gitHubClient";
import {
	ConsoleAndFileLogger,
	FileLogger,
	ProjectData,
	interactionCreate,
	loadCommands,
	logError,
	Numbers,
} from "./Util";

config({ path: join(__dirname, "../.env") });

const { GITHUB_TOKEN: token } = process.env;
const { Events, ActivityTypes } = Constants;
const options: ClientOptions = {
	...Options.createDefault(),
	allowedMentions: { repliedUser: false, parse: [], roles: [], users: [] },
	http: {
		api: "https://canary.discord.com/api",
		cdn: "https://cdn.discordapp.com",
		invite: "https://discord.gg",
		template: "https://discord.new",
		version: Numbers.version,
	},
	intents: Numbers.intents,
	invalidRequestWarningInterval: Numbers.invalidRequestWarningInterval,
	presence: { activities: [{ name: "with GitHub", type: ActivityTypes.PLAYING }] },
	restGlobalRateLimit: Numbers.restGlobalRateLimit,
	restRequestTimeout: Numbers.restRequestTimeout,
	restTimeOffset: Numbers.restTimeOffset,
	shards: "auto",
	userAgentSuffix: [`@${ProjectData.author}/${ProjectData.name}@v${ProjectData.version}`],
	ws: {
		large_threshold: Numbers.largeThreshold,
		compress: true,
		properties: {
			$browser: "discord.js",
			$device: "discord.js",
			$os: process.platform,
		},
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
		ApplicationCommandManager: Numbers.cache,
	}),
};

assert(token, string());

const client = new Client(options);
const gitHubClient = new GitHubClient({ token, client });

client
	.once(Events.ERROR, logError)
	.once(Events.INVALIDATED, () => process.exit(Numbers.invalidatedExitCode))
	.once(Events.CLIENT_READY, async (readyClient) => {
		await Promise.all([loadCommands(gitHubClient), readyClient.application.fetch()] as const).catch(
			(err) => {
				logError(err);
				return undefined;
			}
		);
		process.send?.("ready");
	})
	.on(Events.INTERACTION_CREATE, interactionCreate.bind(gitHubClient))
	.on(Events.DEBUG, (message) => void ConsoleAndFileLogger.info(message))
	.on(Events.WARN, (warn) => {
		ConsoleAndFileLogger.warn(warn);
	})
	.on(Events.INVALID_REQUEST_WARNING, ({ count, remainingTime }) => {
		const requestsPerMinute =
			count / (Numbers.secondsIn10Minutes / (remainingTime / Numbers.milliseconds));
		ConsoleAndFileLogger.info(`Registered ${requestsPerMinute} requests per minute.`);
		if (requestsPerMinute >= Numbers.maxInvalidRequestsPerMinute)
			process.exit(Numbers.invalidRequestExitCode);
	});

process
	.once("exit", (code) => ConsoleAndFileLogger.error(`Process exited with code ${code}`))
	.once("message", (msg) => {
		if (msg === "shutdown") {
			ConsoleAndFileLogger.error("Shutdown request received!");
			client.destroy();
			process.exit(0);
		}
	})
	.on("uncaughtException", logError)
	.on("multipleResolves", (type) =>
		ConsoleAndFileLogger.warn(
			`A promise was ${type}${type === "reject" ? "e" : ""}d more than once!`
		)
	)
	.on("warning", (warn) => {
		console.warn(warn);
		FileLogger.warn(inspect(warn));
	});

void gitHubClient.login();
void client.login();
