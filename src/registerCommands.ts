import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";
import { promises } from "fs";
import { join } from "path";
import { assert, boolean, instance, optional, string, type } from "superstruct";

console.time("Register slash commands");

config({ path: join(__dirname, "../.env") });

const {
	DISCORD_CLIENT_ID: applicationId,
	TEST_GUILD: guildId,
	DISCORD_TOKEN: token,
	GLOBAL_COMMANDS,
} = process.env;
const registerGlobal = GLOBAL_COMMANDS === "true";

assert(applicationId, string());
assert(guildId, string());
assert(token, string());

promises
	.readdir(join(__dirname, "commands"))
	.then((files) =>
		Promise.all(
			files
				.filter((file): file is `${string}.js` => file.endsWith(".js"))
				.map(async (file) => {
					const fileData = (await import(join(__dirname, "commands", file))) as unknown;
					assert(
						fileData,
						type({
							command: type({
								data: instance(SlashCommandBuilder),
								ownerOnly: optional(boolean()),
							}),
						})
					);
					return fileData;
				})
		)
	)
	.then((files) =>
		new REST({ version: "9" })
			.setToken(token)
			.put(
				registerGlobal
					? Routes.applicationCommands(applicationId)
					: Routes.applicationGuildCommands(applicationId, guildId),
				{
					body: files
						.filter((cmd) => Boolean(cmd.command.ownerOnly) !== registerGlobal)
						.map((file) => file.command.data.toJSON()),
				}
			)
	)
	.then((res) => {
		console.log(res);
		console.timeEnd("Register slash commands");
	})
	.catch(console.error);
