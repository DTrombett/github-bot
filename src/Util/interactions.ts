import type { Awaited, ClientEvents, ConstantsEvents } from "discord.js";
import { Collection, CommandInteraction } from "discord.js";
import { promises } from "fs";
import { join } from "path";
import { assert, instance, optional } from "superstruct";
import type { CommandOptions } from ".";
import { ConsoleAndFileLogger, sBoolean, sCommandOptions } from ".";
import type { GitHubClient } from "../gitHubClient";
import { logError } from "./error";
import { fetchFollowers } from "./fetchFollowers";
import fetchUser from "./fetchUser";

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
	 * If this command is private
	 */
	ownerOnly!: boolean;

	/**
	 * The name of this command
	 */
	readonly name: string;

	/**
	 * The GitHub client of this command
	 */
	readonly client: GitHubClient;

	constructor(options: CommandOptions, client: GitHubClient) {
		assert(options, sCommandOptions);
		this.client = client;
		this.name = options.data.name;
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
		this.resolveProperties(((await import(path)) as { command: CommandOptions }).command);
		return this;
	}

	/**
	 * Execute this command.
	 * @param interaction - The interaction received
	 */
	async run(interaction: CommandInteraction): Promise<void> {
		assert(interaction, instance(CommandInteraction));
		if (!this.enabled)
			return interaction.reply({
				content: "Sorry, this command is temporarily disabled!",
				ephemeral: true,
			});
		try {
			const result = await this.callback(interaction);
			if (typeof result === "string" || typeof result === "object")
				return void interaction[
					interaction.replied || interaction.deferred ? "editReply" : "reply"
				](result).catch(logError);
		} catch (err) {
			logError(err);
		}
		return undefined;
	}

	private resolveProperties({ run, data, ownerOnly }: CommandOptions) {
		this.callback = run.bind(this);
		this.data = data;
		this.ownerOnly = ownerOnly ?? false;
	}
}

export const handleError = (interaction: CommandInteraction): Promise<void> => {
	ConsoleAndFileLogger.error(`Received command ${interaction.commandName} not loaded`);
	return interaction[interaction.replied || interaction.deferred ? "editReply" : "reply"]({
		content: "Sorry, there was a problem loading this command!",
		ephemeral: true,
	}).then(() => undefined);
};

export const interactionCreate: (
	...args: ClientEvents[ConstantsEvents["INTERACTION_CREATE"]]
) => Awaited<void> = async (interaction) => {
	if (interaction.isCommand()) {
		const command = commands.get(interaction.commandName);
		return command?.run(interaction).catch(logError) ?? handleError(interaction);
	}
	if (interaction.isButton()) {
		const { client } = commands.first()!;
		const [func, ...args] = interaction.customId.split("-");
		const arg0 = args.join("-");
		if (func === "fetchuser") return fetchUser(client, interaction, arg0);
		if (func === "fetchfollowers") return fetchFollowers(client, interaction, arg0);
		return interaction.deferUpdate();
	}
	return undefined;
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
							import(join(__dirname, "../commands", file)) as Promise<{ command: CommandOptions }>
					)
			)
		)
		.then((files) => {
			for (const command of files.map((file) => file.command))
				commands.set(command.data.name, new Command(command, client));
			return commands;
		});

export default interactionCreate;
