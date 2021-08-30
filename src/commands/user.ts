import { bold, hyperlink, SlashCommandBuilder, time } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import type { CommandOptions } from "../Util";
import { logError, UserType } from "../Util";

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
		const user = await this.client.users
			.fetch(interaction.options.getString("username") ?? this.client.user!.username)
			.catch((err) => {
				if (err instanceof Error) return err.message;
				logError(err);
				return "Unknown error";
			});
		if (typeof user === "string") return `Error: ${user}`;

		const description: string[] = [];
		if (user.bio != null) description.push(`${user.bio}\n`);
		if (user.company != null) description.push(`${bold("Company:")} ${user.company}`);
		if (user.createdAt != null)
			description.push(`${bold("Created:")} ${time(user.createdAt, "F")}`);
		if (user.email != null) description.push(`${bold("Public email:")} ${user.email}`);
		if (user.followersCount != null)
			description.push(`${bold("Followers:")} ${user.followersCount}`);
		if (user.followingCount != null)
			description.push(`${bold("Following:")} ${user.followingCount}`);
		if (user.location != null) description.push(`${bold("Location:")} ${user.location}`);
		if (user.publicGistsCount != null)
			description.push(`${bold("Public gists:")} ${user.publicGistsCount}`);
		if (user.publicRepositoryCount != null)
			description.push(`${bold("Public repositories:")} ${user.publicRepositoryCount}`);
		if (user.twitter != null)
			description.push(`${bold("Twitter:")} ${hyperlink(user.twitter, user.twitterUrl!)}`);
		if (user.website != null) description.push(`${bold("Website:")} ${user.website}`);
		if (user.updatedAt != null)
			description.push(`${bold("Last update:")} ${time(user.updatedAt, "F")}`);
		description.push(`${bold("Type:")} ${UserType[user.type]}`);

		return {
			embeds: [
				new MessageEmbed()
					.setAuthor(user.username, user.avatarUrl, user.avatarUrl)
					.setURL(user.url)
					.setTitle(`User info for ${user.displayName}`)
					.setFooter("Last update", this.client.user!.avatarUrl)
					.setTimestamp(user.lastUpdatedTimestamp ?? Date.now())
					.setThumbnail(user.avatarUrl)
					.setDescription(description.join("\n")),
			],
		};
	},
};
