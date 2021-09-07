import { Client } from "discord.js";
import { GitHubClient } from "../../src/gitHubClient";
import { Command } from "../../src/Util/interactions";
import { command } from "../../src/commands/dev";
import {
	APIApplicationCommandInteraction,
	APIInteractionGuildMember,
	APIMessage,
	APIMessageButtonInteractionData,
	APIMessageComponentInteraction,
	APIUser,
	ComponentType,
	InteractionType,
} from "discord-api-types/v9";
import { ClientUser } from "../../src/gitHubClient/structures/ClientUser";

export const testIntents = 0;
export const testUsername = "DTrombett";
export const testId = "123456789012345678";
export const testDiscriminator = "1234";
export const testCommandName = "dev";
export const testToken = "abcdefghijklmnopqrstuvwxyz";
export const testTimestamp = "1970-01-01T00:00:00.000Z";
export const testCustomId = "test";
export const testNoop = () => {};
export const testDiscordClient = new Client({ intents: testIntents });
export const testClient = new GitHubClient({ client: testDiscordClient });
export const testCommand = new Command({ ...command, run: testNoop }, testClient);
export const testUser = {
	avatar: null,
	discriminator: testDiscriminator,
	id: testId,
	username: testUsername,
};
export const testCommandInteractionData = ({
	name = testCommandName,
	user = testUser,
	guild_id,
	member,
	id = testId,
	token = testToken,
}: {
	name?: string;
	user?: APIUser;
	guild_id?: string;
	member?: APIInteractionGuildMember;
	id?: string;
	token?: string;
} = {}): APIApplicationCommandInteraction & { message: APIMessage } => ({
	id,
	application_id: id,
	type: InteractionType.ApplicationCommand,
	token,
	version: 1,
	data: {
		id,
		name,
	},
	channel_id: id,
	message: {
		attachments: [],
		author: user,
		channel_id: id,
		content: "",
		edited_timestamp: null,
		embeds: [],
		id,
		mention_everyone: false,
		mention_roles: [],
		mentions: [],
		pinned: false,
		timestamp: testTimestamp,
		tts: false,
		type: 0,
	},
	user,
	guild_id,
	member,
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

testClient.user = new ClientUser(testClient, { login: testUsername });
