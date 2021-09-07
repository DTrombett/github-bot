import { showFollowers } from "../../src/Util/showFollowers";
import { ButtonInteraction, Collection, CommandInteraction } from "discord.js";
import {
	testButtonInteractionData,
	testClient,
	testCommandInteractionData,
	testDiscordClient,
	testUsername,
} from "./Util";
import User from "../../src/gitHubClient/structures/User";

test("show user followers", async () => {
	await showFollowers({
		interaction: new CommandInteraction(testDiscordClient, testCommandInteractionData()),
		username: testUsername,
		followers: "Unknown error",
	}).catch((err) => expect(err instanceof Error).toBe(true));
	await showFollowers({
		interaction: new CommandInteraction(testDiscordClient, testCommandInteractionData()),
		username: "",
		followers: "",
	}).catch((err) => expect(err instanceof Error).toBe(true));
	await showFollowers({
		interaction: new ButtonInteraction(testDiscordClient, testButtonInteractionData()),
		username: testUsername,
		followers: new Collection([
			["user", new User(testClient, { login: "user" })],
			["test", new User(testClient, { login: "test" })],
		]),
	}).catch((err) => expect(err instanceof Error).toBe(true));
	await showFollowers({
		interaction: new ButtonInteraction(testDiscordClient, testButtonInteractionData()),
		username: "",
		followers: new Collection(),
	}).catch((err) => expect(err instanceof Error).toBe(true));
});
