import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../Util";
import { errorMessage, logError, userInfo } from "../Util";

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
		await interaction.deferReply().catch(logError);

		const username = interaction.options.getString("username") ?? this.client.user.username;

		await userInfo(
			interaction,
			username,
			await this.client.users.fetch(username).catch(errorMessage)
		);
	},
};

export default command;
