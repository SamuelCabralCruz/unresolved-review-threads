import {OctokitInstance} from "@/src/octokitInstance";
import {UnresolvedActionContext} from "@/src/context";

export const setCheckStatusAsPending = async (octokit: OctokitInstance, context: UnresolvedActionContext) => {
    await octokit.repos.createCommitStatus({
        owner: context.repoOwner,
        repo: context.repoName,
        sha: context.pullRequest.head.sha,
        state: "pending",
        context: `${context.workflowName} / ${context.jobName} (pull_request)`,
        description: "in progress...",
        target_url: `https://github.com/${context.repoOwner}/${context.repoName}/actions/runs/${context.runId}`,
    })
}

export const setCheckStatusAsSuccess = async (octokit: OctokitInstance, context: UnresolvedActionContext) => await octokit.repos.createCommitStatus({
    owner: context.repoOwner,
    repo: context.repoName,
    sha: context.pullRequest.head.sha,
    state: "success",
    context: `${context.workflowName} / ${context.jobName} (pull_request)`,
    description: "no unresolved threads found",
    target_url: `https://github.com/${context.repoOwner}/${context.repoName}/actions/runs/${context.runId}`,
})

export const setCheckStatusAsFailure = async (octokit: OctokitInstance, context: UnresolvedActionContext, numberOfUnresolvedThreads: number) => await octokit.repos.createCommitStatus({
    owner: context.repoOwner,
    repo: context.repoName,
    sha: context.pullRequest.head.sha,
    state: "success",
    context: `${context.workflowName} / ${context.jobName} (pull_request)`,
    description: `${numberOfUnresolvedThreads} unresolved threads found`,
    target_url: `https://github.com/${context.repoOwner}/${context.repoName}/actions/runs/${context.runId}`,
})
