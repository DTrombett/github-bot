import type { Awaited, ClientEvents } from "discord.js";

export const interactionCreate: (...args: ClientEvents["interactionCreate"]) => Awaited<void> = (
	interaction
) => {
	console.log(interaction);
};

export default interactionCreate;
