import type { ButtonInteraction, CommandInteraction } from "discord.js";
import { Constants, MessageActionRow, MessageButton } from "discord.js";
import type { GitHubClient } from "../gitHubClient";
import logError, { errorMessage } from "./error";
import userEmbed from "./userEmbed";
import { UserType } from "./Util";

export const fetchUser = async (
	client: GitHubClient,
	interaction: ButtonInteraction | CommandInteraction,
	username = client.user.username
): Promise<void> => {
	await interaction.deferReply().catch(logError);
	const user = await client.users.fetch(username).catch(errorMessage);
	if (typeof user === "string") return void interaction.editReply(`Error: ${user}`);
	return void interaction.editReply({
		embeds: [userEmbed(user)],
		components:
			user.type === UserType.User
				? [
						new MessageActionRow().addComponents(
							new MessageButton()
								.setCustomId(`fetchfollowers-${username}`)
								.setLabel(`Fetch ${user.displayName} followers`)
								.setStyle(Constants.MessageButtonStyles.PRIMARY)
						),
				  ]
				: [],
	});
};

export default fetchUser;
