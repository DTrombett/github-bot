import { bold, codeBlock } from "@discordjs/builders";
import type { APIMessage } from "discord-api-types/v9";
import type { ButtonInteraction, CommandInteraction, Message } from "discord.js";
import { MessageEmbed, Util } from "discord.js";

const splitOptions = { append: "```", maxLength: 1024, prepend: "```powershell\n" } as const;
const name = "\u200b";
const boldInput = bold("Input");

/**
 * Display the result of a shell command.
 * @param data - The data about the shell result
 * @returns The message sent
 */
export const logShell = (data: {
	interaction: ButtonInteraction | CommandInteraction;
	input: string;
	output: {
		stdout: string;
		stderr: string;
	};
}): Promise<APIMessage | Message> => {
	const embed = new MessageEmbed()
		.setDescription(`${boldInput}\n${codeBlock("shell", data.input)}`)
		.setColor(
			data.output.stdout && data.output.stderr ? "YELLOW" : data.output.stderr ? "RED" : "GREEN"
		)
		.setFooter("Executed at")
		.setTimestamp()
		.setTitle("Shell");

	if (data.output.stdout)
		embed.addFields(
			...Util.splitMessage(codeBlock("powershell", data.output.stdout), splitOptions)
				.map((value) => ({ value, name }))
				.slice(0, Math.floor((6000 - embed.length) / 1024))
		);
	if (data.output.stderr)
		embed.addFields(
			...Util.splitMessage(codeBlock("powershell", data.output.stderr), splitOptions)
				.map((value) => ({ value, name }))
				.slice(0, Math.floor((6000 - embed.length) / 1024))
		);

	return data.interaction.editReply({
		embeds: [embed],
	});
};

export default logShell;
