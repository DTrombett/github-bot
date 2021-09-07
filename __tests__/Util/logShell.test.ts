import { logShell } from "../../src/Util/logShell";
import { ButtonInteraction, CommandInteraction } from "discord.js";
import { testButtonInteractionData, testCommandInteractionData, testDiscordClient } from "..";

test("log the result of a shell command", async () => {
	await logShell({
		interaction: new CommandInteraction(testDiscordClient, testCommandInteractionData()),
		input: "npm ls",
		output: { stderr: "", stdout: "list" },
	}).catch((err) => expect(err instanceof Error).toBe(true));
	await logShell({
		interaction: new CommandInteraction(testDiscordClient, testCommandInteractionData()),
		input: "npm ls",
		output: { stderr: "error", stdout: "" },
	}).catch((err) => expect(err instanceof Error).toBe(true));
	await logShell({
		interaction: new ButtonInteraction(testDiscordClient, testButtonInteractionData()),
		input: "",
		output: { stderr: "", stdout: "" },
	}).catch((err) => expect(err instanceof Error).toBe(true));
	await logShell({
		interaction: new ButtonInteraction(testDiscordClient, testButtonInteractionData()),
		input: "",
		output: { stderr: "error", stdout: "list" },
	}).catch((err) => expect(err instanceof Error).toBe(true));
});
