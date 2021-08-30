import { hyperlink, hideLinkEmbed, bold } from "@discordjs/builders";
import type { ButtonInteraction, CommandInteraction } from "discord.js";
import { MessageActionRow, MessageButton, Constants } from "discord.js";
import logError, { errorMessage } from "./error";
import type { GitHubClient } from "../gitHubClient";

const followersCount = 18;

export const fetchFollowers = async (
	client: GitHubClient,
	interaction: ButtonInteraction | CommandInteraction,
	username = client.user.username
): Promise<void> => {
	await interaction.deferReply().catch(logError);
	const followers = await client.fetchFollowers(username, followersCount).catch(errorMessage);
	if (typeof followers === "string") return interaction.reply(`Error: ${followers}`);

	const users = followers
		.map((user) => hyperlink(user.displayName, hideLinkEmbed(user.url)))
		.join(", ");
	const displayName = bold(hyperlink(username, hideLinkEmbed(`https://github.com/${username}`)));

	return void interaction.editReply({
		content: users ? `${displayName} followers: ${users}` : `${displayName} has no followers!`,
		components: [
			new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId(`fetchuser-${username}`)
					.setLabel(`Display ${username} info`)
					.setStyle(Constants.MessageButtonStyles.PRIMARY)
			),
		],
	});
};
