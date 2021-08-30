import type { GitHubClient } from "..";
import type { ResponseData, UserData } from "../../Util";
import { UserType } from "../../Util";
import Base from "./Base";

export class User extends Base {
	/**
	 * The username of this user
	 */
	username!: string;

	/**
	 * The id of this user
	 */
	id!: number;

	/**
	 * The avatar URL of this user
	 */
	avatarUrl!: `https://avatars.githubusercontent.com/u/${string}?v=4`;
	/**
	 * The Gravatar id of this user, if any
	 */
	gravatarId: string | null = null;

	/**
	 * The GitHub url of this user
	 */
	url!: `https://github.com/${string}`;

	/**
	 * If this user is a normal user or an organization
	 */
	type!: UserType;

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

	protected _nodeId!: string;

	constructor(client: GitHubClient, response: ResponseData<UserData>) {
		super(client, response);
		this._patch(response);
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
			.get<UserData, null>({ etag: this._etag })
			.then((response) => (response ? this._patch(response) : this));
	}

	_patch({ headers, data }: ResponseData<UserData>): this {
		super._patch({ data, headers });

		const {
			avatar_url,
			gravatar_id,
			html_url,
			id,
			login,
			node_id,
			type,
			bio,
			blog,
			company,
			created_at,
			email,
			followers,
			following,
			location,
			name,
			public_gists,
			public_repos,
			twitter_username,
			updated_at,
		} = data;

		this._nodeId = node_id;
		this.username = login;
		this.id = id;
		this.avatarUrl = avatar_url;
		if (gravatar_id !== "") this.gravatarId = gravatar_id;
		this.url = html_url;
		this.type = UserType[type];
		if (name != null) this.name = name;
		if (company != null) this.company = company;
		if (blog != null && blog !== "") this.website = blog;
		if (location != null) this.location = location;
		if (email != null) this.email = email;
		if (bio != null) this.bio = bio;
		if (twitter_username != null) this.twitter = twitter_username;
		if (public_repos != null) this.publicRepositoryCount = public_repos;
		if (public_gists != null) this.publicGistsCount = public_gists;
		if (followers != null) this.followersCount = followers;
		if (following != null) this.followingCount = following;
		if (created_at != null) this.createdAt = new Date(created_at);
		if (updated_at != null) this.updatedAt = new Date(updated_at);

		return this;
	}
}

export default User;
