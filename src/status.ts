import {OctokitInstance} from "@/src/octokitInstance";
import {PullRequest} from "@/src/PullRequest";

export const setPullRequestStatus = async (octokit: OctokitInstance, repoOwner: string, repoName: string, pullRequest: PullRequest, state: "pending" | "failure" | "success", runId: number) => await octokit.repos.createCommitStatus({
    owner: repoOwner,
    repo: repoName,
    sha: pullRequest.head.sha,
    state,
    context: "Test Usage / unresolvedReviewThreads (pull_request)",
    description: `${3} unresolved threads identified`,
    target_url: `https://github.com/${repoOwner}/${repoName}/actions/runs/${runId}`,
})
