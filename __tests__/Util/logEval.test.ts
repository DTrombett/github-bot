import { logEval } from "../../src/Util/logEval";
import { ButtonInteraction, CommandInteraction } from "discord.js";
import { testButtonInteractionData, testCommandInteractionData, testDiscordClient } from "./Util";

test("log the result of an eval command", async () => {
	await logEval({
		interaction: new CommandInteraction(testDiscordClient, testCommandInteractionData()),
		result: "Test",
	}).catch((err) => expect(err instanceof Error).toBe(true));
	await logEval({
		interaction: new CommandInteraction(testDiscordClient, testCommandInteractionData()),
		result: new Error("Test"),
	}).catch((err) => expect(err instanceof Error).toBe(true));
	await logEval({
		interaction: new ButtonInteraction(testDiscordClient, testButtonInteractionData()),
		result: { test: "test" },
	}).catch((err) => expect(err instanceof Error).toBe(true));
});
