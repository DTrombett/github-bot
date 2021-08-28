import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";
import { promises } from "fs";
import { join } from "path";
import { assert, instance, type } from "superstruct";
import { sSnowflake, sString } from "./superstruct";

console.time("Register slash commands");

config();

const {
	DISCORD_CLIENT_ID: applicationId,
	TEST_GUILD: guildId,
	DISCORD_TOKEN: token,
	GLOBAL_COMMANDS: registerGlobal,
} = process.env;

assert(applicationId, sSnowflake);
assert(guildId, sSnowflake);
assert(token, sString);

promises
	.readdir(join(__dirname, "../commands/"))
	.then((files) =>
		Promise.all(
			files
				.filter((file): file is `${string}.js` => file.endsWith(".js"))
				.map(async (file) => {
					const fileData = (await import(join(__dirname, "../commands", file))) as unknown;
					assert(fileData, type({ command: type({ data: instance(SlashCommandBuilder) }) }));
					return fileData.command.data.toJSON();
				})
		)
	)
	.then((body) =>
		new REST({ version: "9" })
			.setToken(token)
			.put(
				registerGlobal === "true"
					? Routes.applicationCommands(applicationId)
					: Routes.applicationGuildCommands(applicationId, guildId),
				{ body }
			)
	)
	.then(() => {
		console.timeEnd("Register slash commands");
	})
	.catch(console.error);
