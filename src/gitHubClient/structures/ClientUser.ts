import { Collection } from "@discordjs/collection";
import type { GitHubClient } from "..";
import type { ClientUserData, EmailData, UserData, UserPatchData, UserPlan } from "../../Util";
import { Numbers } from "../../Util";
import { UserManager } from "../managers/UserManager";
import { Email } from "./Email";
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

	/**
	 * Users blocked by the client
	 */
	blockedUsers = new UserManager(this.client);

	/**
	 * Emails owned by this user
	 */
	emails = new Collection<string, Email>();

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
			.get<ClientUserData, false>()
			.then((response) => (response ? this._patch(response) : this));
	}

	/**
	 * Update this user with new data.
	 * @param data - The new data of the user
	 * @returns The updated user
	 */
	edit(data: UserPatchData): Promise<this> {
		return this.client.api.user
			.patch<ClientUserData, false>({
				data: {
					name: data.username,
					email: data.email,
					blog: data.website,
					twitter_username: data.twitter,
					company: data.company,
					location: data.location,
					bio: data.bio,
				},
			})
			.then((clientData) => (clientData ? this._patch(clientData) : this));
	}

	/**
	 * Set a new username for this user.
	 * @param username - The new username
	 * @returns The updated user
	 */
	setUsername(username: string): Promise<this> {
		return this.edit({ username });
	}

	/**
	 * Set a new email for this user.
	 * @param email - The new email
	 * @returns The updated user
	 */
	setEmail(email: string): Promise<this> {
		return this.edit({ email });
	}

	/**
	 * Set a new website for this user.
	 * @param website - The new website
	 * @returns The updated user
	 */
	setWebsite(website: string): Promise<this> {
		return this.edit({ website });
	}

	/**
	 * Set a new twitter username for this user.
	 * @param twitter - The new twitter username
	 * @returns The updated user
	 */
	setTwitter(twitter: string | null): Promise<this> {
		return this.edit({ twitter });
	}

	/**
	 * Set a new company for this user.
	 * @param company - The new company
	 * @returns The updated user
	 */
	setCompany(company: string): Promise<this> {
		return this.edit({ company });
	}

	/**
	 * Set a new location for this user.
	 * @param location - The new location
	 * @returns The updated user
	 */
	setLocation(location: string): Promise<this> {
		return this.edit({ location });
	}

	/**
	 * Set a new bio for this user.
	 * @param bio - The new bio
	 * @returns The updated user
	 */
	setBio(bio: string): Promise<this> {
		return this.edit({ bio });
	}

	//#region Blocking users

	/**
	 * Fetch the users blocked by the client.
	 * @returns A collection of blocked users
	 */
	fetchBlockedUsers(): Promise<this["blockedUsers"]["cache"]> {
		return this.client.api.user.blocks.get<UserData[], false>().then((data) => {
			if (data) {
				this.blockedUsers.cache.clear();
				for (const user of data) {
					this.blockedUsers.add(user);
					this.client.users.add(user);
				}
			}
			return this.blockedUsers.cache;
		});
	}

	/**
	 * Check if a user has been blocked by the client.
	 * @param user - The user to check
	 * @returns If the user is blocked or not
	 */
	isBlocked(user: User | string): Promise<boolean> {
		const username = typeof user === "string" ? user : user.username;
		return this.client.api.blocks[username]
			.get<never>()
			.then((code) => {
				if (code == null) return this.blockedUsers.cache.has(username);
				this.blockedUsers.add({ login: username });
				this.client.users.add({ login: username });
				return true;
			})
			.catch(() => false);
	}

	/**
	 * Block a user.
	 * @param user - The user to block
	 * @returns The new collection of blocked users
	 */
	block(user: User | string): Promise<this["blockedUsers"]["cache"]> {
		const username = typeof user === "string" ? user : user.username;
		return this.client.api.user.blocks[username].put<never>().then(() => {
			this.blockedUsers.add({ login: username });
			this.client.users.add({ login: username });
			return this.blockedUsers.cache;
		});
	}

	/**
	 * Unblock a user.
	 * @param user - The user to unblock
	 * @returns The new collection of blocked users
	 */
	unblock(user: User | string): Promise<this["blockedUsers"]> {
		const username = typeof user === "string" ? user : user.username;
		return this.client.api.user.blocks[username].delete().then(() => {
			this.blockedUsers.cache.delete(username);
			return this.blockedUsers;
		});
	}

	//#endregion

	//#region Emails

	/**
	 * Set the visibility of the primary email.
	 * @param visible - If the email should be public or private
	 * @returns The updated user
	 */
	setEmailVisibility(visible: boolean): Promise<this> {
		return this.client.api.user.email.visibility
			.patch<EmailData[], false>({ data: { visibility: visible ? "public" : "private" } })
			.then((emails) =>
				emails && visible
					? this._patch({
							login: this.username,
							email: emails.find((email) => email.visibility === "public")?.email,
					  })
					: this
			);
	}

	/**
	 * Fetch the emails for this user.
	 * @param results - How many results to fetch
	 * @param page - The page number to fetch
	 * @returns The emails of this user
	 */
	fetchEmails(results = 100, page = 1): Promise<this["emails"]> {
		return this.client.api.user.emails
			.get<EmailData[], false>({ query: { per_page: results.toString(), page: page.toString() } })
			.then((emails) => {
				if (emails)
					for (const email of emails)
						this.emails.set(email.email, new Email(this.client, email, this));
				return this.emails;
			});
	}

	/**
	 * Add email addresses for this account.
	 * @param emails - Emails to add
	 * @returns The new emails of this user
	 */
	addEmails(...emails: string[]): Promise<this["emails"]> {
		if (!emails.length)
			return Promise.reject(new RangeError("You must specify at least one email address to add"));
		return this.client.api.user.emails
			.post<EmailData[], false>({ data: { emails } })
			.then((newEmails) => {
				if (newEmails)
					this.emails = new Collection(
						newEmails.map((email) => [email.email, new Email(this.client, email, this)])
					);
				return this.emails;
			});
	}

	/**
	 * Delete email addresses for this account.
	 * @param emails - Emails to delete
	 * @returns The new emails of this user
	 */
	deleteEmails(...emails: string[]): Promise<this["emails"]> {
		if (!emails.length)
			return Promise.reject(
				new RangeError("You must specify at least one email address to delete")
			);
		return this.client.api.user.emails.delete<never>({ data: { emails } }).then(() => {
			for (const email of emails) this.emails.delete(email);
			return this.emails;
		});
	}

	/**
	 * Fetch public emails for this user.
	 * @param results - How many results to fetch
	 * @param page - The page number to fetch
	 * @returns The emails of this user
	 */
	fetchPublicEmails(results = 100, page = 1): Promise<this["emails"]> {
		return this.client.api.user.public_emails
			.get<EmailData[], false>({ query: { per_page: results.toString(), page: page.toString() } })
			.then((emails) => {
				if (emails)
					for (const email of emails)
						this.emails.set(email.email, new Email(this.client, email, this));
				return this.emails;
			});
	}

	//#endregion

	//#region Followers

	/**
	 * Fetch followers of the client.
	 * @param results - Number of results to fetch
	 * @param page - Number of the page to fetch
	 * @returns A collection of users who follow this account
	 */
	fetchFollowers(results = Numbers.resultsPerPage, page = 1): Promise<this["followers"]> {
		return this.client.api.user.followers
			.get<UserData[], false>({ query: { per_page: results.toString(), page: page.toString() } })
			.then((followers) => {
				if (followers)
					for (const user of followers) this.followers.set(user.login, this.client.users.add(user));
				return this.followers;
			});
	}

	//#endregion

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
