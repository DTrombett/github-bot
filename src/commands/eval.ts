import {
	codeBlock,
	SlashCommandBooleanOption,
	SlashCommandBuilder,
	SlashCommandNumberOption,
	SlashCommandStringOption,
} from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { inspect } from "util";
import type { CommandOptions } from "../Util";

const embedLength = 4096;
const codeBlockLength = 10;
const breakLength = 100;

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("A private eval command.")
		.setDefaultPermission(true)
		.addStringOption(
			new SlashCommandStringOption().setRequired(true).setName("input").setDescription("The input")
		)
		.addBooleanOption(
			new SlashCommandBooleanOption()
				.setName("showhidden")
				.setDescription("Whether or not to show hidden properties. Default: false")
		)
		.addNumberOption(
			new SlashCommandNumberOption()
				.setName("depth")
				.setDescription("How many nested objects to check. Default: 2")
		)
		.addBooleanOption(
			new SlashCommandBooleanOption()
				.setName("ephemeral")
				.setDescription("Whether or not to send an ephemeral response. Default: true")
		),
	async run(interaction) {
		if (interaction.user.id !== interaction.client.application!.owner?.id)
			return void interaction.reply({
				content: "You're not allowed to run this command!",
				ephemeral: true,
			});
		const result = (await eval(
			`(async function(){${interaction.options.getString("input", true)}}).bind(this)()`
		)) as unknown;
		console.log(result);
		return {
			embeds: inspect(result, {
				showHidden: interaction.options.getBoolean("showhidden") ?? undefined,
				depth: interaction.options.getNumber("depth") ?? undefined,
				breakLength,
				showProxy: true,
				sorted: true,
			})
				.match(new RegExp(`[\\s\\S]{1,${embedLength - codeBlockLength}}`, "gu"))
				?.map((s) => new MessageEmbed({ description: codeBlock("js", s) })),
			ephemeral: interaction.options.getBoolean("ephemeral") ?? true,
		};
	},
};
