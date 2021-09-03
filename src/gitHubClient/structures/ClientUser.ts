import type { Collection } from "@discordjs/collection";
import type { GitHubClient } from "..";
import type { ClientUserData, UserData, UserPlan } from "../../Util";
import { Numbers } from "../../Util";
import { User } from "./User";

const defaultPlan = { collaboratorsCount: 0, name: "free", privateRepositoryCount: 0, space: 0 };

export class ClientUser extends User {
	/**
	 * How many private gists this user has
	 */
	privateGistsCount = 0;

	/**
	 * How many total private repositories this user has
	 */
	privateRepositoriesCount = 0;

	/**
	 * How many private repositories are owned by this user
	 */
	ownedPrivateRepositoriesCount = 0;

	/**
	 * The disk usage of this user
	 */
	diskUsage: number | null = null;

	/**
	 * How many collaborators are part of this organization
	 */
	collaboratorsCount = 1;

	/**
	 * If this user has enabled 2FA
	 */
	MFAEnabled = false;

	/**
	 * The plan of this user
	 */
	plan: UserPlan = defaultPlan;

	constructor(client: GitHubClient, data: ClientUserData) {
		super(client, data);
		this._patch(data);
	}

	/**
	 * Fetch this client user from the API.
	 * @returns The updated client user
	 */
	fetch(): Promise<this> {
		return this.client.api.user
			.get<ClientUserData>()
			.then((response) => (response ? this._patch(response) : this));
	}

	/**
	 * Fetch followers of the client.
	 * @param perPage - Number of results to fetch
	 * @param page - Number of the page to fetch
	 * @returns A collection of users who follow this account
	 */
	fetchFollowers(perPage = Numbers.resultsPerPage, page = 1): Promise<Collection<string, User>> {
		return this.client.api.user.followers
			.get<UserData[]>({ query: { per_page: perPage.toString(), page: page.toString() } })
			.then((followers) => {
				if (followers)
					for (const user of followers) this.followers.set(user.login, this.client.users.add(user));
				return this.followers;
			});
	}

	_patch(data: ClientUserData): this {
		super._patch(data);

		if (data.private_gists != null) this.privateGistsCount = data.private_gists;
		if (data.total_private_repos != null) this.privateRepositoriesCount = data.total_private_repos;
		if (data.owned_private_repos != null)
			this.ownedPrivateRepositoriesCount = data.owned_private_repos;
		if (data.disk_usage != null) this.diskUsage = data.disk_usage;
		if (data.collaborators != null) this.collaboratorsCount = data.collaborators;
		if (data.two_factor_authentication != null) this.MFAEnabled = data.two_factor_authentication;
		if (data.plan != null)
			this.plan = {
				collaboratorsCount: data.plan.collaborators,
				name: data.plan.name,
				privateRepositoryCount: data.plan.private_repos,
				space: data.plan.space,
			};

		return this;
	}
}
