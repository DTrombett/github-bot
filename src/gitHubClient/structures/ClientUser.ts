import type { GitHubClient } from "..";
import type { ClientUserData, ResponseData, UserPlan } from "../../Util";
import User from "./User";

export class ClientUser extends User {
	/**
	 * How many private gists this user has
	 */
	privateGistsCount!: number;

	/**
	 * How many total private repositories this user has
	 */
	privateRepositoriesCount!: number;

	/**
	 * How many private repositories are owned by this user
	 */
	ownedPrivateRepositoriesCount!: number;

	/**
	 * The disk usage of this user
	 */
	diskUsage!: number;

	/**
	 * How many collaborators are part of this user
	 */
	collaboratorsCount!: number;

	/**
	 * If this user has enabled 2FA
	 */
	MFAEnabled!: boolean;

	/**
	 * The plan of this user
	 */
	plan!: UserPlan;

	constructor(client: GitHubClient, response: ResponseData<ClientUserData>) {
		super(client, response);
		this._patch(response);
	}

	/**
	 * Fetch this client user from the API.
	 * @returns The updated client user
	 */
	fetch(): Promise<this> {
		return this.client.api.user
			.get<ClientUserData, null>({ etag: this._etag })
			.then((response) => (response ? this._patch(response) : this));
	}

	_patch({ data, headers }: ResponseData<ClientUserData>): this {
		super._patch({ data, headers });
		const {
			private_gists,
			total_private_repos,
			owned_private_repos,
			disk_usage,
			collaborators,
			two_factor_authentication,
			plan,
		} = data;

		this.privateGistsCount = private_gists;
		this.privateRepositoriesCount = total_private_repos;
		this.ownedPrivateRepositoriesCount = owned_private_repos;
		this.diskUsage = disk_usage;
		this.collaboratorsCount = collaborators;
		this.MFAEnabled = two_factor_authentication;
		this.plan = {
			collaboratorsCount: plan.collaborators,
			name: plan.name,
			privateRepositoryCount: plan.private_repos,
			space: plan.space,
		};

		return this;
	}
}
