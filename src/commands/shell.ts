import { SlashCommandBuilder } from "@discordjs/builders";
import { exec } from "child_process";
import { is, type } from "superstruct";
import { inspect, promisify } from "util";
import type { CommandOptions } from "../Util";
import { logError, logShell, sString } from "../Util";

const sStd = type({ stdout: sString, stderr: sString });
const asyncExec = promisify(exec);
const getError = (err: unknown) =>
	is(err, sStd) ? { stderr: err.stderr, stdout: err.stdout } : { stdout: "", stderr: inspect(err) };

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("shell")
		.setDescription("Execute a command in the shell")
		.addStringOption((option) =>
			option.setName("command").setDescription("The command to execute").setRequired(true)
		)
		.addBooleanOption((option) =>
			option
				.setName("ephemeral")
				.setDescription("If the reply should be ephemeral or not. Default: true")
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

		const input = interaction.options.getString("command", true);

		await logShell(interaction, input, await asyncExec(input).catch(getError));
		return undefined;
	},
};
