/* istanbul ignore file */
import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../Util";
import { errorMessage, Numbers, showFollowers, userInfo } from "../Util";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("user")
		.setDescription("Get the info about a GitHub user")
		.addSubcommand((sub) =>
			sub
				.setName("info")
				.setDescription("Show general info about a user")
				.addStringOption((option) =>
					option
						.setName("username")
						.setDescription("The username of the user to get. Default: DTrombett")
				)
		)
		.addSubcommand((sub) =>
			sub
				.setName("followers")
				.setDescription("Show followers of a user")
				.addStringOption((option) =>
					option
						.setName("username")
						.setDescription("The username of the user to get. Default: DTrombett")
				)
		),

	async run(interaction) {
		await interaction.deferReply();

		const username = interaction.options.getString("username") ?? this.client.user.username;
		const subCommand = interaction.options.getSubcommand(true);

		if (subCommand === "info")
			await userInfo({
				interaction,
				username,
				user: await this.client.users.fetch(username).catch(errorMessage),
			});
		else if (subCommand === "followers")
			await showFollowers({
				interaction,
				username,
				followers: await this.client
					.fetchFollowers(username, Numbers.followersCount)
					.catch(errorMessage),
			});
	},
};

export default command;
