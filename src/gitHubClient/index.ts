import type { Client } from "discord.js";
import { Webhook, Constants } from "discord.js";
import { asserts } from "superstruct";
import { author, name, version } from "../../package.json";
import { getVar, sSnowflakeArray } from "../Util";

export const defaultRequestTimeout = 10_000;
export const webhookData = {
	username: "GitHub",
	avatar: "df91181b3f1cf0ef1592fbe18e0962d7",
} as const;
const { MESSAGE_CREATE } = Constants.Events;

export class GitHubClient {
	token: string;
	timeZone: string;
	discordClient: Client;
	userAgent: string;
	requestTimeout: number;

	constructor({
		token,
		client,
		timeZone = "Europe/Rome",
		userAgent = `@${author}/${name}@${version}`,
		requestTimeout = defaultRequestTimeout,
	}: {
		token: string;
		client: Client;
		timeZone?: string;
		userAgent?: string;
		requestTimeout?: number;
	}) {
		this.token = token;
		this.timeZone = timeZone;
		this.discordClient = client;
		this.userAgent = userAgent;
		this.requestTimeout = requestTimeout;

		client.on(MESSAGE_CREATE, async (message) => {
			const webhooks = await getVar("webhooks");
			asserts(webhooks, sSnowflakeArray);
                        const { webhookId } = message;
                        if (webhookId == null || !webhooks.includes(webhookId)) return;
                        const webhook = await message.fetchWebhook().catch(console.error);
                        if (!webhook || webhook.username !== webhookData.username || webhook.avatar !== webhookData.avatar) return;
                        console.log(message.embeds[0]);
		});
	}
}
