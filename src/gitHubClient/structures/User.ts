import { Collection } from "@discordjs/collection";
import type { GitHubClient } from "..";
import type { UserData } from "../../Util";
import { Numbers, UserType } from "../../Util";
import { Base } from "./Base";

export class User extends Base {
	/**
	 * The username of this user
	 */
	username!: string;

	/**
	 * The id of this user
	 */
	id: number | null = null;

	/**
	 * The avatar URL of this user
	 */
	avatarUrl: `https://avatars.githubusercontent.com/u/${string}?v=4` | null = null;
	/**
	 * The Gravatar id of this user, if any
	 */
	gravatarId: string | null = null;

	/**
	 * The GitHub url of this user
	 */
	url: `https://github.com/${string}` = `https://github.com/${this.username}`;

	/**
	 * If this user is a normal user or an organization
	 */
	type: UserType = 1;

	/**
	 * An optional name displayed in the app
	 */
	name: string | null = null;

	/**
	 * The company this user is part of, if any
	 */
	company: string | null = null;

	/**
	 * An url to the website of this user shared in their profile, if any
	 */
	website: string | null = null;

	/**
	 * The public position of this user shared in their profile, if any
	 */
	location: string | null = null;

	/**
	 * The email of this user shared in their profile, if any
	 */
	email: string | null = null;

	/**
	 * The bio of this user shared in their profile, if any
	 */
	bio: string | null = null;

	/**
	 * The Twitter username of this user shared in their profile, if any
	 */
	twitter: string | null = null;

	/**
	 * The number of public repositories owned by this user
	 */
	publicRepositoryCount: number | null = null;

	/**
	 * The number of public gists owned by this user
	 */
	publicGistsCount: number | null = null;

	/**
	 * How many users are following this account
	 */
	followersCount: number | null = null;

	/**
	 * How many users is this account following
	 */
	followingCount: number | null = null;

	/**
	 * When this user was created
	 */
	createdAt: Date | null = null;

	/**
	 * When this user was updated
	 */
	updatedAt: Date | null = null;

	/**
	 * A collection of the followers of this user
	 */
	followers = new Collection<string, User>();

	protected _nodeId: string | null = null;

	constructor(client: GitHubClient, data: UserData) {
		super(client, data);
		this._patch(data);
	}

	/**
	 * The name displayed on GitHub
	 */
	get displayName(): string {
		return this.name ?? this.username;
	}

	/**
	 * The url of the twitter profile of this user, if any
	 */
	get twitterUrl(): `https://twitter.com/${this["twitter"]}` | null {
		return this.twitter != null ? `https://twitter.com/${this.twitter}` : null;
	}

	/**
	 * The timestamp in milliseconds when this user was created
	 */
	get createdTimestamp(): number | null {
		return this.createdAt?.getTime() ?? null;
	}

	/**
	 * The timestamp in milliseconds when this user was updated
	 */
	get updatedTimestamp(): number | null {
		return this.updatedAt?.getTime() ?? null;
	}

	/**
	 * Fetch this user from the API.
	 * @returns The updated user
	 */
	fetch(): Promise<this> {
		return this.client.api.users[this.username]
			.get<UserData>()
			.then((response) => (response ? this._patch(response) : this));
	}

	/**
	 * Fetch followers of this user.
	 * @param perPage - Number of results to fetch
	 * @param page - Number of the page to fetch
	 * @returns A collection of users who follow this account
	 */
	fetchFollowers(perPage = Numbers.resultsPerPage, page = 1): Promise<Collection<string, User>> {
		return this.client.api
			.users(this.username)
			.followers.get<UserData[]>({ query: { per_page: perPage.toString(), page: page.toString() } })
			.then((followers) => {
				if (followers)
					for (const user of followers) this.followers.set(user.login, this.client.users.add(user));
				return this.followers;
			});
	}

	_patch(data: UserData): this {
		this.username = data.login;
		if (data.node_id != null) this._nodeId = data.node_id;
		if (data.id != null) this.id = data.id;
		if (data.avatar_url != null) this.avatarUrl = data.avatar_url;
		if (data.gravatar_id != null && data.gravatar_id !== "") this.gravatarId = data.gravatar_id;
		if (data.html_url != null) this.url = data.html_url;
		if (data.type != null) this.type = UserType[data.type];
		if (data.name != null) this.name = data.name;
		if (data.company != null) this.company = data.company;
		if (data.blog != null && data.blog !== "") this.website = data.blog;
		if (data.location != null) this.location = data.location;
		if (data.email != null) this.email = data.email;
		if (data.bio != null) this.bio = data.bio;
		if (data.twitter_username != null) this.twitter = data.twitter_username;
		if (data.public_repos != null) this.publicRepositoryCount = data.public_repos;
		if (data.public_gists != null) this.publicGistsCount = data.public_gists;
		if (data.followers != null) this.followersCount = data.followers;
		if (data.following != null) this.followingCount = data.following;
		if (data.created_at != null) this.createdAt = new Date(data.created_at);
		if (data.updated_at != null) this.updatedAt = new Date(data.updated_at);

		return this;
	}
}

export default User;
