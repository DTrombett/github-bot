import { ButtonInteraction, Client, CommandInteraction, Interaction } from "discord.js";
import { GitHubClient } from "../../src/gitHubClient";
import { Command, commands, interactionCreate, loadCommands } from "../../src/Util/interactions";
import { command } from "../../src/commands/dev";
import {
	APIMessageButtonInteractionData,
	APIUser,
	GatewayInteractionCreateDispatchData,
} from "discord-api-types/v9";
import { ButtonId } from "../../src/Util";
import { SlashCommandBuilder } from "@discordjs/builders";

const testDiscordClient = new Client({ intents: 0 });
const testClient = new GitHubClient({ client: testDiscordClient });
const testCommand = new Command({ ...command, run: () => {} }, testClient);
const testInteractionData = ({
	name = "dev",
	custom_id = "",
	user = {
		avatar: null,
		discriminator: "1234",
		id: "123456789012345678",
		username: "Discord",
	},
}: {
	name?: string;
	custom_id?: string;
	user?: APIUser;
} = {}): GatewayInteractionCreateDispatchData & APIMessageButtonInteractionData => ({
	component_type: 1,
	custom_id,
	id: "123456789012345678",
	application_id: "123456789012345678",
	type: 2,
	token: "abcdefghijklmnopqrstuvwxyz",
	version: 1,
	data: { values: [], custom_id, name, component_type: 1 },
	channel_id: "123456789012345678",
	message: {
		attachments: [],
		author: user,
		channel_id: "123456789012345678",
		content: "",
		edited_timestamp: null,
		embeds: [],
		id: "123456789012345678",
		mention_everyone: false,
		mention_roles: [],
		mentions: [],
		pinned: false,
		timestamp: "1970-01-01T00:00:00.000Z",
		tts: false,
		type: 0,
	},
	user,
});

test("test Command class", async () => {
	// Test properties
	expect(testCommand).toBeInstanceOf(Command);
	expect(testCommand.callback).toBeInstanceOf(Function);
	expect(testCommand.client).toBe(testClient);
	expect(testCommand.data).toBe(command.data);
	expect(testCommand.name).toBe(command.data.name);

	// Test ownerOnly
	expect(testCommand.ownerOnly).toBe(true);
	testCommand.ownerOnly = false;
	expect(testCommand.ownerOnly).toBe(false);

	// Test enabled-disabled
	expect(testCommand.enabled).toBe(true);
	expect(testCommand.run(CommandInteraction.prototype)).resolves.toBe(undefined);
	testCommand.setEnabled(false);
	expect(testCommand.enabled).toBe(false);
	testCommand.enable();
	expect(testCommand.enabled).toBe(true);
	testCommand.disable();
	expect(testCommand.enabled).toBe(false);
	testCommand.setEnabled(true);
	expect(testCommand.enabled).toBe(true);
	testCommand.setEnabled();
	expect(testCommand.enabled).toBe(true);

	// Test run with enabled
	expect(
		new Command(
			{
				...command,
				run: () => {
					throw new Error("Test error");
				},
			},
			testClient
		).run(CommandInteraction.prototype)
	).resolves.toBeUndefined();

	// Test run with disabled
	testCommand.disable();
	await testCommand
		.run(CommandInteraction.prototype)
		.catch((err) => expect(err instanceof Error).toBe(true));

	// Test reload
	expect(testCommand.reload()).resolves.toBe(true);

	expect(
		new Command(
			{ ...command, data: new SlashCommandBuilder().setName("testCommand") },
			testClient
		).reload()
	).rejects.toBeDefined();
});

test("load commands", async () => {
	expect(loadCommands(testClient)).resolves.toBeGreaterThanOrEqual(1);
});

test("test interactionCreate event", async () => {
	const interactionEvent = interactionCreate.bind(testClient) as OmitThisParameter<
		typeof interactionCreate
	>;
	commands.get("dev")!.callback = () => {};
	await Promise.all([
		interactionEvent(Interaction.prototype),
		interactionEvent(new CommandInteraction(testDiscordClient, testInteractionData())),
		interactionEvent(
			new CommandInteraction(testDiscordClient, testInteractionData({ name: "unexistent-command" }))
		),
		interactionEvent(
			new ButtonInteraction(
				testDiscordClient,
				testInteractionData({ custom_id: `${ButtonId.user}-DTrombett` })
			)
		),
		interactionEvent(
			new ButtonInteraction(
				testDiscordClient,
				testInteractionData({ custom_id: `${ButtonId.followers}-DTrombett` })
			)
		),
		interactionEvent(new ButtonInteraction(testDiscordClient, testInteractionData())),
	])
		.then((results) => {
			expect(Array.isArray(results)).toBe(true);
			for (const r of results) expect(r).toBeUndefined();
		})
		.catch((results) => {
			expect(Array.isArray(results)).toBe(true);
			for (const r of results) expect(r).toBeUndefined();
		});
});
