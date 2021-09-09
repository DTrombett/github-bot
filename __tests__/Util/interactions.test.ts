import { ButtonInteraction, CommandInteraction, Interaction } from "discord.js";
import { Command, commands, interactionCreate, loadCommands } from "../../src/Util/interactions";
import { command } from "../../src/commands/dev";
import { ButtonId } from "../../src/Util";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
	testClient,
	testCommand,
	testDiscordClient,
	testCommandInteractionData,
	testButtonInteractionData,
	testId,
	testAPIGuildMember,
} from "..";

const testInteraction = Interaction.prototype;
const testCommandInteraction = new CommandInteraction(
	testDiscordClient,
	testCommandInteractionData({ data: { name: "dev", id: testId, type: 1 } })
);
const testCommandInteractionUnexistent = new CommandInteraction(
	testDiscordClient,
	testCommandInteractionData()
);
const testCommandInteractionUnexistentDeferred = new CommandInteraction(
	testDiscordClient,
	testCommandInteractionData()
);
const testCommandInteractionInGuild = new CommandInteraction(
	testDiscordClient,
	testCommandInteractionData({
		member: testAPIGuildMember,
		guild_id: testId,
		data: { id: testId, name: "dev", type: 1 },
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
const testButtonInteraction = new ButtonInteraction(testDiscordClient, testButtonInteractionData());

testCommandInteractionUnexistentDeferred.deferred = true;

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
