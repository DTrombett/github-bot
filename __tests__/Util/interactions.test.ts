import { ButtonInteraction, CommandInteraction, Constants, Interaction } from "discord.js";
import { Command, commands, interactionCreate, loadCommands } from "../../src/Util/interactions";
import { command } from "../../src/commands/dev";
import { ButtonId } from "../../src/Util";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ClientUser } from "../../src/gitHubClient/structures/ClientUser";
import {
	testClient,
	testCommand,
	testDiscordClient,
	testCommandInteractionData,
	testUser,
	testButtonInteractionData,
} from "./Util";

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
	expect(testCommand.reload().then((cmd) => cmd.ownerOnly)).resolves.toBe(true);

	expect(
		new Command(
			{ ...command, data: new SlashCommandBuilder().setName("test-command") },
			testClient
		).reload()
	).rejects.toBeDefined();
});

test("load commands", async () => {
	expect(loadCommands(testClient).then((cmds) => cmds.size)).resolves.toBeGreaterThanOrEqual(1);
});

test("test interactionCreate event", async () => {
	const interactionEvent = interactionCreate.bind(testClient) as OmitThisParameter<
		typeof interactionCreate
	>;
	await loadCommands(testClient).then((cmds) => expect(cmds.size).toBeGreaterThanOrEqual(1));
	commands.get("dev")!.callback = () => {};
	const testInteraction = Interaction.prototype;
	const testCommandInteraction = new CommandInteraction(
		testDiscordClient,
		testCommandInteractionData()
	);
	const testCommandInteractionUnexistent = new CommandInteraction(
		testDiscordClient,
		testCommandInteractionData({ name: "unexistent-command" })
	);
	const testCommandInteractionUnexistentDeferred = new CommandInteraction(
		testDiscordClient,
		testCommandInteractionData({ name: "unexistent-command" })
	);
	const testCommandInteractionInGuild = new CommandInteraction(
		testDiscordClient,
		testCommandInteractionData({
			member: {
				deaf: false,
				joined_at: "1970-01-01T00:00:00.000Z",
				mute: false,
				permissions: "0",
				roles: [],
				user: testUser,
			},
			guild_id: "123456789012345678",
		})
	);
	const testButtonInteractionUser = new ButtonInteraction(
		testDiscordClient,
		testButtonInteractionData(`${ButtonId.user}-DTrombett`)
	);
	const testButtonInteractionFollowers = new ButtonInteraction(
		testDiscordClient,
		testButtonInteractionData(`${ButtonId.followers}-DTrombett`)
	);
	const testButtonInteraction = new ButtonInteraction(
		testDiscordClient,
		testButtonInteractionData()
	);

	testCommandInteractionUnexistentDeferred.deferred = true;

	await Promise.all([
		interactionEvent(testInteraction),
		interactionEvent(testCommandInteraction),
		interactionEvent(testCommandInteractionUnexistent),
		interactionEvent(testCommandInteractionUnexistentDeferred),
		interactionEvent(testCommandInteractionInGuild),
		interactionEvent(testButtonInteractionUser),
		interactionEvent(testButtonInteractionFollowers),
		interactionEvent(testButtonInteraction),
	]).then((results) => {
		expect(Array.isArray(results)).toBe(true);
		for (const r of results) expect(r).toBeUndefined();
	});
});
