import type { GitHubClient } from "..";
import type { EmailData } from "../../Util";
import { EmailVisibility } from "../../Util";
import { Base } from "./Base";
import type { ClientUser } from "./ClientUser";

export class Email extends Base {
	/**
	 * User who owns this email
	 */
	user: ClientUser;

	/**
	 * The email address
	 */
	email!: string;

	/**
	 * If this email is verified or not
	 */
	verified = false;

	/**
	 * If this is the primary email address for the user
	 */
	primary = false;

	/**
	 * If this email is visible or not
	 */
	visibility: EmailVisibility = 0;

	constructor(client: GitHubClient, data: EmailData, user: ClientUser) {
		super(client, data);
		this.user = user;
		this._patch(data);
	}

	_patch(data: EmailData): this {
		this.email = data.email;
		if (data.verified != null) this.verified = data.verified;
		if (data.primary != null) this.primary = data.primary;
		if (data.visibility != null) this.visibility = EmailVisibility[data.visibility];
		return this;
	}
}

export default Email;
