import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../Util";
import { errorMessage, logError, Numbers, showFollowers } from "../Util";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("followers")
		.setDescription("Get a list of followers of a user")
		.addStringOption((option) =>
			option
				.setName("username")
				.setDescription("The username of the user to get. Default: DTrombett")
		),
	async run(interaction) {
		await interaction.deferReply().catch(logError);

		const username = interaction.options.getString("username") ?? this.client.user.username;

		await showFollowers(
			interaction,
			username,
			await this.client.fetchFollowers(username, Numbers.followersCount).catch(errorMessage)
		);
	},
};

export default command;
