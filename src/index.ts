import type { ClientOptions, GuildMember, User } from "discord.js";
import { Client, Constants, Options } from "discord.js";
import { config } from "dotenv";
import { assert } from "superstruct";
import { GitHubClient } from "./gitHubClient";
import { sClientOptions, sString, IntentsFlags } from "./Util";

config();

const { GITHUB_TOKEN: token } = process.env;

const invalidRequestWarningInterval = 1;
const restGlobalRateLimit = 50;
const restRequestTimeout = 10_000;
const restTimeOffset = 1_000;

const limitedManagerOptions = {
	maxSize: 1,
	sweepFilter: () => (userOrMember: GuildMember | User) =>
		userOrMember.id !== userOrMember.client.user?.id,
} as const;

const options: ClientOptions = {
	intents: (1 << IntentsFlags.GUILDS) | (1 << IntentsFlags.GUILD_MESSAGES),
	allowedMentions: { parse: ["everyone"] },
	failIfNotExists: false,
	http: {
		api: "https://canary.discord.com/api",
	},
	invalidRequestWarningInterval,
	presence: { activities: [{ name: "With GitHub", type: Constants.ActivityTypes.PLAYING }] },
	restGlobalRateLimit,
	restRequestTimeout,
	restTimeOffset,
	shards: "auto",
	userAgentSuffix: ["@DTrombett/github-bot@v1.0.0"],
	ws: {
		large_threshold: 0,
	},
	makeCache: Options.cacheWithLimits({
		...Options.defaultMakeCacheSettings,
		BaseGuildEmojiManager: 0,
		GuildBanManager: 0,
		GuildInviteManager: 0,
		GuildMemberManager: limitedManagerOptions,
		GuildStickerManager: 0,
		PresenceManager: 0,
		ReactionManager: 0,
		ReactionUserManager: 0,
		StageInstanceManager: 0,
		UserManager: limitedManagerOptions,
		VoiceStateManager: 0,
	}),
	rejectOnRateLimit({ global, limit, method, path, route, timeout }) {
		console.warn(
			`Discord ${method} request queued on ${route} for ${
				global ? "global" : "route"
			} ratelimit.\nLimit of ${limit} requests reached for ${timeout}ms on path ${path}.`
		);
		return false;
	},
};

assert(token, sString);
assert(options, sClientOptions);

const client = new Client(options)
	.on(Constants.Events.CLIENT_READY, (readyClient) => {
		console.log(
			`Succesfully logged as ${client.user?.tag ?? "Unknown User"} in ${
				readyClient.guilds.cache.size
			} guilds.`
		);
	})
	.on(Constants.Events.DEBUG, console.debug)
	.on(Constants.Events.ERROR, console.error)
	.on(Constants.Events.GUILD_CREATE, (guild) => {
		console.log("Joined a new guild!");
		console.log(guild);
	})
	.on(Constants.Events.GUILD_DELETE, (guild) => {
		console.log("Left a guild!");
		console.log(guild);
	})
	.on(Constants.Events.INVALIDATED, () => process.exit())
	.on(Constants.Events.INVALID_REQUEST_WARNING, console.warn)
	.on(Constants.Events.RATE_LIMIT, console.error)
	.on(Constants.Events.WARN, console.warn)
	.on(Constants.Events.SHARD_DISCONNECT, (event, shard) => {
		console.error(`Shard ${shard} disconnected for an error!`);
		console.error(event);
	})
	.on(Constants.Events.SHARD_RECONNECTING, (shard) => {
		console.info(`Shard ${shard} is reconnecting...`);
	})
	.on(Constants.Events.SHARD_RESUME, (shard, events) => {
		console.info(`Shard ${shard} resumed! Replayed ${events} events.`);
	});

new GitHubClient({ token, client }).login();

client.login().catch(console.error);
