import type { GitHubClient } from "..";
import type { UserData } from "../../Util";
import { User } from "../structures/User";
import { BaseManager } from "./BaseManager";

export class UserManager extends BaseManager<User> {
	constructor(client: GitHubClient) {
		super(client, User, ["users", ":id"]);
	}

	/**
	 * Fetch a user from the API.
	 * @param username The username of the user to fetch
	 * @returns The fetched user
	 */
	async fetch(username: string): Promise<User> {
		return super.fetch(username);
	}

	add(data: UserData): User {
		return super.add(data, data.login);
	}
}

export default UserManager;
