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
		const {
			private_gists,
			total_private_repos,
			owned_private_repos,
			disk_usage,
			collaborators,
			two_factor_authentication,
			plan,
		} = data;

		if (private_gists != null) this.privateGistsCount = private_gists;
		if (total_private_repos != null) this.privateRepositoriesCount = total_private_repos;
		if (owned_private_repos != null) this.ownedPrivateRepositoriesCount = owned_private_repos;
		if (disk_usage != null) this.diskUsage = disk_usage;
		if (collaborators != null) this.collaboratorsCount = collaborators;
		if (two_factor_authentication != null) this.MFAEnabled = two_factor_authentication;
		if (plan != null)
			this.plan = {
				collaboratorsCount: plan.collaborators,
				name: plan.name,
				privateRepositoryCount: plan.private_repos,
				space: plan.space,
			};

		return this;
	}
}
