import type { Awaited, ClientEvents, ConstantsEvents } from "discord.js";
import { Collection, CommandInteraction } from "discord.js";
import { promises } from "fs";
import { join } from "path";
import { assert, instance, is, optional, union } from "superstruct";
import type { CommandOptions } from ".";
import {
	ConsoleAndFileLogger,
	sBoolean,
	sCommandOptions,
	sInteractionReplyOptions,
	sString,
} from ".";
import type { GitHubClient } from "../gitHubClient";

export const commands = new Collection<string, Command>();

/**
 * Represent a Discord slash command
 */
export class Command {
	/**
	 * The data of this slash command
	 */
	data!: CommandOptions["data"];

	/**
	 * The function to execute when this command is called
	 */
	callback!: OmitThisParameter<CommandOptions["run"]>;

	/**
	 * If this command is enabled or not
	 */
	enabled = true;

	/**
	 * The GitHub client of this command
	 */
	readonly client: GitHubClient;

	constructor(options: CommandOptions, client: GitHubClient) {
		assert(options, sCommandOptions);
		this.client = client;
		this.resolveProperties(options);
	}

	/**
	 * Enable this command.
	 * @returns The new command
	 */
	enable(): this {
		this.enabled = true;
		return this;
	}

	/**
	 * Disable this command.
	 * @returns The new command
	 */
	disable(): this {
		this.enabled = false;
		return this;
	}

	/**
	 * Set if the command should be enabled.
	 * @param enabled If this command should be enabled or not
	 * @returns The new command
	 */
	setEnabled(enabled?: boolean): this {
		assert(enabled, optional(sBoolean));
		this.enabled = enabled ?? this.enabled;
		return this;
	}

	/**
	 * Reload the data for this command.
	 * @returns The new command
	 */
	async reload(): Promise<this> {
		const path = join(__dirname, "../commands", this.data.name);
		delete require.cache[require.resolve(path)];
		this.resolveProperties(((await import(path)) as { default: CommandOptions }).default);
		return this;
	}

	async run(interaction: CommandInteraction): Promise<void> {
		assert(interaction, instance(CommandInteraction));
		if (!this.enabled)
			return interaction.reply({
				content: "Sorry, this command is temporarily disabled!",
				ephemeral: true,
			});
		const result = await this.callback(interaction);
		if (is(result, union([sString, sInteractionReplyOptions])))
			return void interaction[interaction.replied ? "editReply" : "reply"](result).catch(
				console.error
			);
		return result;
	}

	private resolveProperties({ run, data }: CommandOptions) {
		this.callback = run.bind(this);
		this.data = data;
	}
}

export const interactionCreate: (
	...args: ClientEvents[ConstantsEvents["INTERACTION_CREATE"]]
) => Awaited<void> = (interaction) => {
	if (!interaction.isCommand()) return;
	const command = commands.get(interaction.commandName);
	if (command) return void command.run(interaction);
	interaction
		.reply({
			content: "Sorry, there was a problem loading this command!",
			ephemeral: true,
		})
		.catch(console.error);
	ConsoleAndFileLogger.error(`Received command ${interaction.commandName} not loaded`);
};

export const loadCommands = (client: GitHubClient): Promise<typeof commands> =>
	promises
		.readdir(join(__dirname, "../commands"))
		.then((files) =>
			Promise.all(
				files
					.filter((file): file is `${string}.js` => file.endsWith(".js"))
					.map(
						(file) =>
							import(join(__dirname, "../commands", file)) as Promise<{ default: CommandOptions }>
					)
			)
		)
		.then((files) =>
			files.map((file) => commands.set(file.default.data.name, new Command(file.default, client)))
		)
		.then(() => commands);

export default interactionCreate;
