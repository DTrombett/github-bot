import { bold, hideLinkEmbed, hyperlink } from "@discordjs/builders";
import type Collection from "@discordjs/collection";
import type { ButtonInteraction, CommandInteraction, Message } from "discord.js";
import { Constants, MessageActionRow, MessageButton } from "discord.js";
import { ButtonId } from "./Util";
import type { User } from "../gitHubClient/structures/User";
import type { APIMessage } from "discord-api-types/v9";

/**
 * Show the followers of a user.
 * @param interaction - The interaction that instantiated this
 * @param username - The userame requested
 * @param followers - A collection of followers for the user
 * @returns The message sent
 */
export const showFollowers = (
	interaction: ButtonInteraction | CommandInteraction,
	username: string,
	followers: Collection<string, User> | string
): Promise<APIMessage | Message> => {
	if (typeof followers === "string") return interaction.editReply(followers);

	const displayName = bold(hyperlink(username, hideLinkEmbed(`https://github.com/${username}`)));

	if (!followers.size) return interaction.editReply(`${displayName} has no followers!`);
	return interaction.editReply({
		content: `${displayName} followers: ${followers
			.map((user) => hyperlink(user.displayName, hideLinkEmbed(user.url)))
			.join(", ")}`,
		components: [
			new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId(`${ButtonId.user}-${username}`)
					.setLabel(`Display ${username} info`)
					.setStyle(Constants.MessageButtonStyles.PRIMARY)
			),
		],
	});
};

export default showFollowers;
