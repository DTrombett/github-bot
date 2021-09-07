import { bold, hyperlink, time } from "@discordjs/builders";
import type { APIMessage } from "discord-api-types/v9";
import type { ButtonInteraction, CommandInteraction, Message } from "discord.js";
import { Constants, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import type { User } from "../gitHubClient/structures/User";
import { ButtonId, UserType } from "./UtilityTypes";

/**
 * Show info about a user.
 * @param data - Data about user
 * @returns The message sent
 */
export const userInfo = (data: {
	interaction: ButtonInteraction | CommandInteraction;
	username: string;
	user: User | string;
}): Promise<APIMessage | Message> => {
	if (typeof data.user === "string") return data.interaction.editReply(`Error: ${data.user}`);

	let description = [`${bold("Type:")} ${UserType[data.user.type]}`];
	if (data.user.bio != null) description = description.concat(`${data.user.bio}\n`);
	if (data.user.company != null)
		description = description.concat(`${bold("Company:")} ${data.user.company}`);
	if (data.user.createdAt != null)
		description = description.concat(`${bold("Created:")} ${time(data.user.createdAt, "F")}`);
	if (data.user.publicEmail != null)
		description = description.concat(`${bold("Public email:")} ${data.user.publicEmail}`);
	if (data.user.followersCount != null)
		description = description.concat(`${bold("Followers:")} ${data.user.followersCount}`);
	if (data.user.followingCount != null)
		description = description.concat(`${bold("Following:")} ${data.user.followingCount}`);
	if (data.user.location != null)
		description = description.concat(`${bold("Location:")} ${data.user.location}`);
	if (data.user.publicGistsCount != null)
		description = description.concat(`${bold("Public gists:")} ${data.user.publicGistsCount}`);
	if (data.user.publicRepositoryCount != null)
		description = description.concat(
			`${bold("Public repositories:")} ${data.user.publicRepositoryCount}`
		);
	if (data.user.twitter != null)
		description = description.concat(
			`${bold("Twitter:")} ${hyperlink(data.user.twitter, data.user.twitterUrl!)}`
		);
	if (data.user.website != null)
		description = description.concat(`${bold("Website:")} ${data.user.website}`);
	if (data.user.updatedAt != null)
		description = description.concat(`${bold("Last update:")} ${time(data.user.updatedAt, "F")}`);

	const embed = new MessageEmbed()
		.setAuthor(data.username, data.user.avatarUrl ?? undefined, data.user.avatarUrl ?? undefined)
		.setURL(data.user.url)
		.setTitle(`User info for ${data.user.displayName}`)
		.setFooter("Last update", data.user.client.user.avatarUrl ?? undefined)
		.setTimestamp(data.user.lastUpdatedTimestamp)
		.setDescription(description.join("\n"))
		.setColor(([null, "RED", "BLUE"] as const)[data.user.type]);
	if (data.user.avatarUrl != null) embed.setThumbnail(data.user.avatarUrl);

	return data.interaction.editReply({
		embeds: [embed],
		components:
			data.user.type === UserType.User
				? [
						new MessageActionRow().addComponents(
							new MessageButton()
								.setCustomId(`${ButtonId.followers}-${data.username}`)
								.setLabel(`Display ${data.username} followers`)
								.setStyle(Constants.MessageButtonStyles.PRIMARY)
						),
				  ]
				: [],
	});
};

export default userInfo;
