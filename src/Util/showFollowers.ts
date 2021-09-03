import { bold, hideLinkEmbed, hyperlink } from "@discordjs/builders";
import type Collection from "@discordjs/collection";
import type { ButtonInteraction, CommandInteraction, Message } from "discord.js";
import { Constants, MessageActionRow, MessageButton } from "discord.js";
import { ButtonId } from "./UtilityTypes";
import type { User } from "../gitHubClient/structures/User";
import type { APIMessage } from "discord-api-types/v9";

/**
 * Show the followers of a user.
 * @param data - Data about followers
 * @returns The message sent
 */
export const showFollowers = (data: {
	interaction: ButtonInteraction | CommandInteraction;
	username: string;
	followers: Collection<string, User> | string;
}): Promise<APIMessage | Message> => {
	if (typeof data.followers === "string") return data.interaction.editReply(data.followers);

	const displayName = bold(
		hyperlink(data.username, hideLinkEmbed(`https://github.com/${data.username}`))
	);

	if (!data.followers.size) return data.interaction.editReply(`${displayName} has no followers!`);
	return data.interaction.editReply({
		content: `${displayName} followers: ${data.followers
			.map((user) => hyperlink(user.displayName, hideLinkEmbed(user.url)))
			.join(", ")}`,
		components: [
			new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId(`${ButtonId.user}-${data.username}`)
					.setLabel(`Display ${data.username} info`)
					.setStyle(Constants.MessageButtonStyles.PRIMARY)
			),
		],
	});
};

export default showFollowers;
