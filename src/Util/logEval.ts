import { codeBlock } from "@discordjs/builders";
import type { APIMessage } from "discord-api-types/v9";
import type { ButtonInteraction, CommandInteraction, Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { inspect } from "util";

/**
 * Display the result of an eval expression.
 * @param data - The data for the eval
 * @returns The message sent
 */
export const logEval = (data: {
	interaction: ButtonInteraction | CommandInteraction;
	result: unknown;
	showHidden?: boolean;
	depth?: number;
}): Promise<APIMessage | Message> => {
	console.log(data.result);
	return data.interaction.editReply({
		embeds: [
			new MessageEmbed({
				description: codeBlock(
					"js",
					inspect(data.result, {
						showHidden: data.showHidden,
						depth: data.depth,
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
