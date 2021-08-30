import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../Util";
import { fetchUser } from "../Util";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("user")
		.setDescription("Get the info about a GitHub user")
		.addStringOption((option) =>
			option
				.setName("username")
				.setDescription("The username of the user to get. Default: DTrombett")
		),
	async run(interaction) {
		return fetchUser(
			this.client,
			interaction,
			interaction.options.getString("username") ?? undefined
		);
	},
};

export default command;