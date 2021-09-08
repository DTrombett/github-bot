import { testAPIRequest, testGitHubAPIError } from "../..";
import { GitHubAPIError } from "../../../src/gitHubClient/rest/GitHubAPIError";
import { ErrorDescription } from "../../../src/Util";

test("test the GitHubAPIError class", () => {
	// Test error properties
	expect(testGitHubAPIError.httpStatus).toBe(400);
	expect(testGitHubAPIError.method).toBe("GET");
	expect(testGitHubAPIError.path).toBe("/user");
	expect(testGitHubAPIError.requestData).toBe(null);

	// Test error message
	expect(testGitHubAPIError.message).toBe(
		`An error occurred\nDocumentation: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user\nUser name: ${ErrorDescription.already_exists}\nUser name: This name is invalid\nDocumentation: https://docs.github.com/en/github/site-policy/github-username-policy\nUser name: This name is bad`
	);
	expect(
		new GitHubAPIError(
			{
				message: "An error occurred",
			},
			400,
			testAPIRequest
		).message
	).toBe("An error occurred");
});
