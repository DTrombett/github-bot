import { Client } from "discord.js";
import { GitHubClient } from "../src/gitHubClient";
import { Command } from "../src/Util/interactions";
import { command } from "../src/commands/dev";
import {
	APIApplicationCommandInteraction,
	APIMessage,
	APIMessageButtonInteractionData,
	APIMessageComponentInteraction,
	ComponentType,
	InteractionType,
} from "discord-api-types/v9";
import { ClientUser } from "../src/gitHubClient/structures/ClientUser";
import { RESTManager } from "../src/gitHubClient/rest/RESTManager";
import { APIRequest } from "../src/gitHubClient/rest/APIRequest";
import { GitHubAPIError } from "../src/gitHubClient/rest/GitHubAPIError";

export type RecursivePartial<T> = {
	[K in keyof T]?: RecursivePartial<T[K]>;
};

export const testIntents = 0;
export const testUsername = "DTrombett";
export const testId = "123456789012345678";
export const testDiscriminator = "1234";
export const testCommandName = "dev";
export const testToken = "abcdefghijklmnopqrstuvwxyz";
export const testTimestamp = "1970-01-01T00:00:00.000Z";
export const testCustomId = "test";
export const testNoop = () => {};
export const testError = new Error("test");
export const testDiscordClient = new Client({ intents: testIntents });
export const testClient = new GitHubClient({ client: testDiscordClient });
export const testRestManager = new RESTManager(testClient);
export const testAPIRequest = new APIRequest(testRestManager, "GET", "/user");
export const testGitHubAPIError = new GitHubAPIError(
	{
		message: "An error occurred",
		documentation_url: "https://docs.github.com/en/rest/reference/users#get-the-authenticated-user",
		errors: [
			{ code: "already_exists", field: "name", resource: "User" },
			{
				code: "custom",
				field: "name",
				message: "This name is invalid",
				resource: "User",
				documentation_url: "https://docs.github.com/en/github/site-policy/github-username-policy",
			},
			{
				code: "custom",
				field: "name",
				message: "This name is bad",
				resource: "User",
			},
		],
	},
	400,
	testAPIRequest
);
export const testCommand = new Command({ ...command, run: testNoop }, testClient);
export const testAPIUser = {
	avatar: null,
	discriminator: testDiscriminator,
	id: testId,
	username: testUsername,
};
export const testCommandInteractionData = (
	data: Partial<APIApplicationCommandInteraction> = {}
): APIApplicationCommandInteraction & { message: APIMessage } => ({
	id: testId,
	application_id: testId,
	type: InteractionType.ApplicationCommand,
	token: testToken,
	version: 1,
	data: {
		id: testId,
		name: "test",
	},
	channel_id: testId,
	message: {
		attachments: [],
		author: testAPIUser,
		channel_id: testId,
		content: "",
		edited_timestamp: null,
		embeds: [],
		id: testId,
		mention_everyone: false,
		mention_roles: [],
		mentions: [],
		pinned: false,
		timestamp: testTimestamp,
		tts: false,
		type: 0,
	},
	user: testAPIUser,
	...data,
});
export const testButtonInteractionData = (
	custom_id = testCustomId
): APIMessageComponentInteraction & {
	data: APIMessageButtonInteractionData;
} & APIMessageButtonInteractionData => ({
	...testCommandInteractionData(),
	data: { component_type: ComponentType.Button, custom_id },
	custom_id,
	component_type: ComponentType.Button,
	type: InteractionType.MessageComponent,
});
export const testAPIGuildMember = {
	deaf: false,
	joined_at: testTimestamp,
	mute: false,
	permissions: "0",
	roles: [],
	user: testAPIUser,
};

testClient.user = new ClientUser(testClient, { login: testUsername });
