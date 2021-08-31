import type { APIMessage } from "discord-api-types/v9";
import type { ButtonInteraction, CommandInteraction, Message } from "discord.js";
import { Constants, MessageActionRow, MessageButton } from "discord.js";
import type { User } from "../gitHubClient/structures/User";
import { userEmbed } from "./userEmbed";
import { ButtonId, UserType } from "./Util";

export const userInfo = (
	interaction: ButtonInteraction | CommandInteraction,
	username: string,
	user: User | string
): Promise<APIMessage | Message> => {
	if (typeof user === "string") return interaction.editReply(`Error: ${user}`);
	return interaction.editReply({
		embeds: [userEmbed(user)],
		components:
			user.type === UserType.User
				? [
						new MessageActionRow().addComponents(
							new MessageButton()
								.setCustomId(`${ButtonId.followers}-${username}`)
								.setLabel(`Display ${username} followers`)
								.setStyle(Constants.MessageButtonStyles.PRIMARY)
						),
				  ]
				: [],
	});
};

export default userInfo;
