import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { inspect } from "util";
import type { CommandOptions } from "../Util";
import { logError } from "../Util";

const embedLength = 4096;
const codeBlockLength = 10;
const breakLength = 100;

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Execute some JavaScript code")
		.setDefaultPermission(true)
		.addStringOption((option) =>
			option.setRequired(true).setName("input").setDescription("The input")
		)
		.addBooleanOption((option) =>
			option
				.setName("showhidden")
				.setDescription("Whether or not to show hidden properties. Default: false")
		)
		.addNumberOption((option) =>
			option.setName("depth").setDescription("How many nested objects to check. Default: 2")
		)
		.addBooleanOption((option) =>
			option
				.setName("ephemeral")
				.setDescription("Whether or not to send an ephemeral response. Default: true")
		),
	async run(interaction) {
		if (interaction.user.id !== interaction.client.application!.owner?.id)
			return void interaction.reply({
				content: "You're not allowed to run this command!",
				ephemeral: true,
			});

		interaction
			.deferReply({ ephemeral: interaction.options.getBoolean("ephemeral") ?? true })
			.catch(logError);
		let result: unknown;

		try {
			result = (await eval(
				`(async function(){${interaction.options.getString("input", true)}}).bind(this)()`
			)) as unknown;
		} catch (err) {
			result = err;
		}

		console.log(result);
		return void interaction.editReply({
			embeds: [
				new MessageEmbed({
					description: codeBlock(
						"js",
						inspect(result, {
							showHidden: interaction.options.getBoolean("showhidden") ?? undefined,
							depth: interaction.options.getNumber("depth") ?? undefined,
							breakLength,
							showProxy: true,
							sorted: true,
						})
					).slice(0, embedLength - codeBlockLength),
				}),
			],
		});
	},
	ownerOnly: true,
};

export default command;
