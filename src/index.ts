import type { ClientOptions } from "discord.js";
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
const large_threshold = 1_000;
const GuildMemberManager = 100;
const UserManager = 1_000;

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
		large_threshold,
	},
	makeCache: Options.cacheWithLimits({
		...Options.defaultMakeCacheSettings,
		BaseGuildEmojiManager: 0,
		GuildBanManager: 0,
		GuildInviteManager: 0,
		GuildStickerManager: 0,
		ReactionManager: 0,
		ReactionUserManager: 0,
		StageInstanceManager: 0,
		VoiceStateManager: 0,
		PresenceManager: 0,
		GuildMemberManager,
		UserManager,
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

const client = new Client(options);
new GitHubClient({ token, client }).login();

client
	.login()
	.then(() => {
		console.log(
			`Succesfully logged as ${client.user?.tag ?? "Unknown User"}. Waiting for guilds...`
		);
	})
	.catch(console.error);
