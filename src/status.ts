import {OctokitInstance} from "@/src/octokitInstance";
import {UnresolvedActionContext} from "@/src/context";

export const setCheckStatusAsSuccess = async (octokit: OctokitInstance, context: UnresolvedActionContext) => await octokit.repos.createCommitStatus({
    owner: context.repoOwner,
    repo: context.repoName,
    sha: context.pullRequest.head.sha,
    state: "success",
    context: "Unresolved Review Threads",
    description: "no unresolved threads found",
    target_url: `https://github.com/${context.repoOwner}/${context.repoName}/actions/runs/${context.runId}`,
})

export const setCheckStatusAsFailure = async (octokit: OctokitInstance, context: UnresolvedActionContext, numberOfUnresolvedThreads: number) => await octokit.repos.createCommitStatus({
    owner: context.repoOwner,
    repo: context.repoName,
    sha: context.pullRequest.head.sha,
    state: "failure",
    context: "Unresolved Review Threads",
    description: `${numberOfUnresolvedThreads} unresolved threads found`,
    target_url: `https://github.com/${context.repoOwner}/${context.repoName}/actions/runs/${context.runId}`,
})
