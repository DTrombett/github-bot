/* eslint-disable prefer-const */
import { bold, SlashCommandBuilder } from "@discordjs/builders";
import { exec } from "child_process";
import type { Client } from "discord.js";
import { promisify } from "util";
import type { CommandOptions } from "../Util";
import { logEval, logShell } from "../Util";

const shell = promisify(exec);
const getMB = (memory: number) => bold(`${Math.round((memory / 1_024 / 1_024) * 1_000) / 1_000}mb`);
const getError = (err: { stdout: string; stderr: string }) => ({
	stderr: err.stderr,
	stdout: err.stdout,
});

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("dev")
		.setDescription("Run some developer utility functions")
		.setDefaultPermission(true)
		.addSubcommand((subCommand) =>
			subCommand
				.setName("eval")
				.setDescription("Execute some JavaScript code")
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
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName("shell")
				.setDescription("Execute a command in the shell")
				.addStringOption((option) =>
					option.setName("command").setDescription("The command to execute").setRequired(true)
				)
		)
		.addSubcommand((subCommand) =>
			subCommand.setName("ram").setDescription("Get the ram usage of this process")
		)
		.addSubcommand((subCommand) =>
			subCommand.setName("uptime").setDescription("Get the uptime of the bot")
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName("restart")
				.setDescription("Restart the bot, applying all code changes that were made")
		),

	async run(interaction) {
		if (interaction.user.id !== interaction.client.application!.owner?.id)
			return void interaction.reply({
				content: "You're not allowed to run this command!",
				ephemeral: true,
			});
		await interaction.deferReply({ ephemeral: true });

		let heapTotal: number,
			heapUsed: number,
			input: string,
			result: unknown,
			rss: number,
			uptime: number;

		switch (interaction.options.getSubcommand(true)) {
			case "eval":
				input = interaction.options.getString("input", true);
				try {
					result = (await eval(
						input.includes("await ") ? `(async function(){${input}}).bind(this)()` : input
					)) as unknown;
				} catch (err) {
					result = err;
				}
				await logEval({
					interaction,
					result,
					showHidden: interaction.options.getBoolean("showhidden") ?? undefined,
					depth: interaction.options.getNumber("depth") ?? undefined,
				});
				break;
			case "shell":
				input = interaction.options.getString("command", true);
				await logShell({ interaction, input, output: await shell(input).catch(getError) });
				break;
			case "ram":
				({ heapUsed, heapTotal, rss } = process.memoryUsage());
				await interaction.editReply({
					content: `RAM used: ${getMB(heapUsed)}/${getMB(heapTotal)} (${Math.round(
						(heapUsed / heapTotal) * 100
					)}%). RSS: ${getMB(rss)} (${Math.round((heapUsed / rss) * 100)}%)`,
				});
				break;
			case "uptime":
				({ uptime } = this.client.discordClient as Client<true>);
				await interaction.editReply(
					`Bot has been online for ${Math.round(uptime / 1_000)}s (${Math.round(
						uptime / 1_000 / 60
					)}m)`
				);
				break;
			case "restart":
				await interaction.editReply("Process is restarting...");
				void shell("pm2 restart 0");
				break;
			default:
				await interaction.editReply("This subCommand is not supported!");
		}
		return undefined;
	},
	ownerOnly: true,
};

export default command;
