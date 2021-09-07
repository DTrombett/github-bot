import { userInfo } from "../../src/Util/userInfo";
import { ButtonInteraction, Collection, CommandInteraction } from "discord.js";
import {
	testButtonInteractionData,
	testClient,
	testCommandInteractionData,
	testDiscordClient,
	testTimestamp,
	testUsername,
} from "..";
import User from "../../src/gitHubClient/structures/User";

test("show user info", async () => {
	await userInfo({
		interaction: new CommandInteraction(testDiscordClient, testCommandInteractionData()),
		username: testUsername,
		user: "Unknown error",
	}).catch((err) => expect(err instanceof Error).toBe(true));
	await userInfo({
		interaction: new CommandInteraction(testDiscordClient, testCommandInteractionData()),
		username: "",
		user: "",
	}).catch((err) => expect(err instanceof Error).toBe(true));
	await userInfo({
		interaction: new ButtonInteraction(testDiscordClient, testButtonInteractionData()),
		username: testUsername,
		user: new User(testClient, {
			login: "user",
			bio: "test",
			company: "test",
			created_at: testTimestamp,
			email: "test@gmail.com",
			followers: 0,
			following: 0,
			location: "Italy",
			public_gists: 0,
			public_repos: 0,
			twitter_username: testUsername,
			blog: "https://example.com/",
			updated_at: testTimestamp,
			avatar_url: "https://avatars.githubusercontent.com/u/73136330?v=4",
		}),
	}).catch((err) => expect(err instanceof Error).toBe(true));
	await userInfo({
		interaction: new ButtonInteraction(testDiscordClient, testButtonInteractionData()),
		username: "",
		user: new User(testClient, { login: "", type: "Organization" }),
	}).catch((err) => expect(err instanceof Error).toBe(true));
});
