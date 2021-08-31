import { bold, hyperlink, time } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { UserType } from "./Util";
import type { User } from "../gitHubClient/structures/User";

const userColor = ["", "RED", "BLUE"] as const;

export const userEmbed = ({
	avatarUrl,
	bio,
	client,
	company,
	createdAt,
	displayName,
	email,
	followersCount,
	followingCount,
	lastUpdatedTimestamp,
	location,
	publicGistsCount,
	publicRepositoryCount,
	twitter,
	twitterUrl,
	type,
	updatedAt,
	url,
	username,
	website,
}: User): MessageEmbed => {
	const description: string[] = [];
	if (bio != null) description.push(`${bio}\n`);
	if (company != null) description.push(`${bold("Company:")} ${company}`);
	if (createdAt != null) description.push(`${bold("Created:")} ${time(createdAt, "F")}`);
	if (email != null) description.push(`${bold("Public email:")} ${email}`);
	if (followersCount != null) description.push(`${bold("Followers:")} ${followersCount}`);
	if (followingCount != null) description.push(`${bold("Following:")} ${followingCount}`);
	if (location != null) description.push(`${bold("Location:")} ${location}`);
	if (publicGistsCount != null) description.push(`${bold("Public gists:")} ${publicGistsCount}`);
	if (publicRepositoryCount != null)
		description.push(`${bold("Public repositories:")} ${publicRepositoryCount}`);
	if (twitter != null) description.push(`${bold("Twitter:")} ${hyperlink(twitter, twitterUrl!)}`);
	if (website != null) description.push(`${bold("Website:")} ${website}`);
	if (updatedAt != null) description.push(`${bold("Last update:")} ${time(updatedAt, "F")}`);
	description.push(`${bold("Type:")} ${UserType[type]}`);

	const embed = new MessageEmbed()
		.setAuthor(username, avatarUrl ?? undefined, avatarUrl ?? undefined)
		.setURL(url)
		.setTitle(`User info for ${displayName}`)
		.setFooter("Last update", client.user.avatarUrl ?? undefined)
		.setTimestamp(lastUpdatedTimestamp ?? Date.now())
		.setDescription(description.join("\n"))
		.setColor(userColor[type]);
	if (avatarUrl != null) embed.setThumbnail(avatarUrl);
	return embed;
};

export default userEmbed;
