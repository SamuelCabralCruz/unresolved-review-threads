import {OctokitInstance} from "@/src/octokitInstance";
import {UnresolvedActionContext} from "@/src/context";
import {PullRequest} from "@/src/PullRequest";

export const setPulLRequestStatus = async (octokit: OctokitInstance, repoOwner: string, repoName: string, pullRequest: PullRequest, state: "pending" | "failure" | "success") => await octokit.repos.createCommitStatus({
    owner: repoOwner,
    repo: repoName,
    sha: pullRequest.head.sha,
    state,
})
