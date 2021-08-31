import { SlashCommandBuilder } from "@discordjs/builders";
import { exec } from "child_process";
import { promisify } from "util";
import type { CommandOptions } from "../Util";
import { logError, logEval } from "../Util";

// @ts-expect-error This is to be executed in the eval
const shell = promisify(exec);

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

		await interaction
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

		await logEval(
			interaction,
			result,
			interaction.options.getBoolean("showhidden") ?? undefined,
			interaction.options.getNumber("depth") ?? undefined
		);
		return undefined;
	},
	ownerOnly: true,
};

export default command;
