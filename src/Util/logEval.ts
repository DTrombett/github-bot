import { codeBlock } from "@discordjs/builders";
import type { APIMessage } from "discord-api-types/v9";
import type { ButtonInteraction, CommandInteraction, Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { inspect } from "util";

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
