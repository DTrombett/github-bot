import { bold, codeBlock } from "@discordjs/builders";
import type { APIMessage } from "discord-api-types/v9";
import type { ButtonInteraction, CommandInteraction, Message } from "discord.js";
import { MessageEmbed, Util } from "discord.js";

const splitOptions = { append: "```", maxLength: 1024, prepend: "```powershell\n" } as const;
const name = "\u200b";
const boldInput = bold("Input");

/**
 * Display the result of a shell command.
 * @param interaction - The interaction that instantiated this
 * @param input - The input command
 * @param output - The result of the shell command
 * @returns The message sent
 */
export const logShell = (
	interaction: ButtonInteraction | CommandInteraction,
	input: string,
	{
		stderr,
		stdout,
	}: {
		stdout: string;
		stderr: string;
	}
): Promise<APIMessage | Message> => {
	const embed = new MessageEmbed()
		.setDescription(`${boldInput}\n${codeBlock("shell", input)}`)
		.setColor(stdout && stderr ? "YELLOW" : stderr ? "RED" : "GREEN")
		.setFooter("Executed at")
		.setTimestamp()
		.setTitle("Shell");

	if (stdout)
		embed.addFields(
			...Util.splitMessage(codeBlock("powershell", stdout), splitOptions)
				.map((value) => ({ value, name }))
				.slice(0, Math.floor((6000 - embed.length) / 1024))
		);
	if (stderr)
		embed.addFields(
			...Util.splitMessage(codeBlock("powershell", stderr), splitOptions)
				.map((value) => ({ value, name }))
				.slice(0, Math.floor((6000 - embed.length) / 1024))
		);

	return interaction.editReply({
		embeds: [embed],
	});
};

export default logShell;
