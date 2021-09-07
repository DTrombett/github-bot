import type { ClientEvents, CommandInteraction, ConstantsEvents } from "discord.js";
import { Collection } from "discord.js";
import { promises } from "fs";
import { join } from "path";
import type { CommandOptions } from ".";
import type { GitHubClient } from "../gitHubClient";
import { ConsoleAndFileLogger } from "./Console";
import { errorMessage, logError } from "./error";
import { showFollowers } from "./showFollowers";
import { userInfo } from "./userInfo";
import { ButtonId, Numbers } from "./UtilityTypes";

/**
 * A collection of all registered commands
 */
export const commands = new Collection<string, Command>();

/**
 * Represent a Discord command
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
	 * If this command is private or not
	 */
	ownerOnly!: boolean;

	/**
	 * The name of this command
	 */
	readonly name: string;

	/**
	 * The GitHub client that instantiated this command
	 */
	readonly client: GitHubClient;

	/**
	 * @param options - Options for this command
	 * @param client - The client that instantiated this
	 */
	constructor(options: CommandOptions, client: GitHubClient) {
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
		this.enabled = enabled ?? this.enabled;
		return this;
	}

	/**
	 * Reload the data for this command.
	 * @returns The new command
	 */
	async reload(): Promise<this> {
		const path = join(__dirname, "../commands", this.name);
		delete require.cache[require.resolve(path)];
		this.resolveProperties(((await import(path)) as { command: CommandOptions }).command);
		return this;
	}

	/**
	 * Execute this command.
	 * @param interaction - The interaction received
	 */
	async run(interaction: CommandInteraction): Promise<void> {
		if (!this.enabled)
			return interaction.reply({
				content: "Sorry, this command is temporarily disabled!",
				ephemeral: true,
			});
		try {
			await this.callback(interaction);
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

/**
 * A function to be executed when a new interaction is received.
 * @param interaction - The received interaction
 */
export async function interactionCreate(
	this: GitHubClient,
	interaction: ClientEvents[ConstantsEvents["INTERACTION_CREATE"]][0]
): Promise<void> {
	if (interaction.isCommand()) {
		const command = commands.get(interaction.commandName);
		if (command) {
			await command.run(interaction).catch(logError);
			return void ConsoleAndFileLogger.info(
				`Command ${command.name} executed by ${interaction.user.tag} (${interaction.user.id}) in ${
					interaction.inGuild() ? `channel with id: ${interaction.channelId}` : "DM"
				}`
			);
		}
		ConsoleAndFileLogger.error(`Received command ${interaction.commandName} not loaded`);
		return void interaction[interaction.replied || interaction.deferred ? "editReply" : "reply"]({
			content: "Sorry, there was a problem loading this command!",
			ephemeral: true,
		}).catch(logError);
	}
	if (interaction.isButton()) {
		const [func, ...args] = interaction.customId.split("-") as [string, ...string[]];
		const arg = args.join("-");
		if (func === ButtonId.user) {
			await interaction.deferReply().catch(logError);
			return void userInfo({
				interaction,
				username: arg,
				user: await this.users.fetch(arg).catch(errorMessage),
			}).catch(logError);
		}
		if (func === ButtonId.followers) {
			await interaction.deferReply().catch(logError);
			return void showFollowers({
				interaction,
				username: arg,
				followers: await this.fetchFollowers(arg, Numbers.followersCount).catch(errorMessage),
			}).catch(logError);
		}
		return interaction.deferUpdate().catch(logError);
	}
	return undefined;
}

/**
 * Load the commands from the `commands` directory.
 * @param client - The client that instantiated this
 * @returns A collection of all registered commands
 */
export const loadCommands = (client: GitHubClient): Promise<typeof commands> =>
	promises
		.readdir(join(__dirname, "../commands"))
		.then((files) =>
			Promise.all(
				files
					.filter(
						(file): file is `${string}.${"j" | "t"}s` =>
							file.endsWith(".js") || file.endsWith(".ts")
					)
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
