import { bold, hyperlink, time } from "@discordjs/builders";
import type { APIMessage } from "discord-api-types/v9";
import type { ButtonInteraction, CommandInteraction, Message } from "discord.js";
import { Constants, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import type { User } from "../gitHubClient/structures/User";
import { ButtonId, UserType } from "./Util";

/**
 * Show info about a user.
 * @param interaction - The interaction that instantiated this
 * @param username - The username requested
 * @param user - The data for the user
 * @returns The message sent
 */
export const userInfo = (
	interaction: ButtonInteraction | CommandInteraction,
	username: string,
	user: User | string
): Promise<APIMessage | Message> => {
	if (typeof user === "string") return interaction.editReply(`Error: ${user}`);

	let description = [`${bold("Type:")} ${UserType[user.type]}`];
	if (user.bio != null) description = description.concat(`${user.bio}\n`);
	if (user.company != null) description = description.concat(`${bold("Company:")} ${user.company}`);
	if (user.createdAt != null)
		description = description.concat(`${bold("Created:")} ${time(user.createdAt, "F")}`);
	if (user.email != null)
		description = description.concat(`${bold("Public email:")} ${user.email}`);
	if (user.followersCount != null)
		description = description.concat(`${bold("Followers:")} ${user.followersCount}`);
	if (user.followingCount != null)
		description = description.concat(`${bold("Following:")} ${user.followingCount}`);
	if (user.location != null)
		description = description.concat(`${bold("Location:")} ${user.location}`);
	if (user.publicGistsCount != null)
		description = description.concat(`${bold("Public gists:")} ${user.publicGistsCount}`);
	if (user.publicRepositoryCount != null)
		description = description.concat(
			`${bold("Public repositories:")} ${user.publicRepositoryCount}`
		);
	if (user.twitter != null)
		description = description.concat(
			`${bold("Twitter:")} ${hyperlink(user.twitter, user.twitterUrl!)}`
		);
	if (user.website != null) description = description.concat(`${bold("Website:")} ${user.website}`);
	if (user.updatedAt != null)
		description = description.concat(`${bold("Last update:")} ${time(user.updatedAt, "F")}`);

	const embed = new MessageEmbed()
		.setAuthor(username, user.avatarUrl ?? undefined, user.avatarUrl ?? undefined)
		.setURL(user.url)
		.setTitle(`User info for ${user.displayName}`)
		.setFooter("Last update", user.client.user.avatarUrl ?? undefined)
		.setTimestamp(user.lastUpdatedTimestamp ?? Date.now())
		.setDescription(description.join("\n"))
		.setColor(([null, "RED", "BLUE"] as const)[user.type]);
	if (user.avatarUrl != null) embed.setThumbnail(user.avatarUrl);

	return interaction.editReply({
		embeds: [embed],
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
