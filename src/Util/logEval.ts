import { codeBlock } from "@discordjs/builders";
import type { APIMessage } from "discord-api-types/v9";
import type { ButtonInteraction, CommandInteraction, Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { inspect } from "util";

/**
 * Display the result of an eval expression.
 * @param interaction - The interaction that instantiated this
 * @param result - The result of the eval
 * @param showHidden - If hidden results should be displayed or not
 * @param depth - How many nested objects should be displayed
 * @returns The message sent
 */
export const logEval = (
	interaction: ButtonInteraction | CommandInteraction,
	result: unknown,
	showHidden?: boolean,
	depth?: number
): Promise<APIMessage | Message> => {
	console.log(result);
	return interaction.editReply({
		embeds: [
			new MessageEmbed({
				description: codeBlock(
					"js",
					inspect(result, {
						showHidden,
						depth,
						breakLength: 100,
						showProxy: true,
						sorted: true,
					})
				).slice(0, 4086),
			}),
		],
	});
};

export default logEval;
