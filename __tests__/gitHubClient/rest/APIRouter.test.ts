import { mockNodeFetch, testAPIRequest, testRestManager } from "../..";
import { buildRoute } from "../../../src/gitHubClient/rest/APIRouter";
import GitHubAPIError from "../../../src/gitHubClient/rest/GitHubAPIError";

mockNodeFetch(() => Promise.reject(new GitHubAPIError({ message: "test" }, 400, testAPIRequest)));
const api = () => buildRoute(testRestManager);

test("test the API router", async () => {
	await expect(api().user.post({ data: { foo: "bar" } })).rejects.toBeInstanceOf(GitHubAPIError);
	expect(api().user("foo", "bar").toString()).toBe("/user/foo/bar");
});
