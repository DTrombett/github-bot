import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../Util";
import { fetchFollowers } from "../Util/fetchFollowers";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("followers")
		.setDescription("Get a list of followers of a user")
		.addStringOption((option) =>
			option.setName("username").setDescription("The username of the user to get")
		),
	async run(interaction) {
		return fetchFollowers(
			this.client,
			interaction,
			interaction.options.getString("username") ?? undefined
		);
	},
};

export default command;
