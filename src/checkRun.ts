import {OctokitInstance} from "@/src/octokitInstance";
import {UnresolvedActionContext} from "@/src/context";
import {PullRequest} from "@/src/PullRequest";

export const getCheckRuns = async (context: UnresolvedActionContext, octokit: OctokitInstance, pullRequest: PullRequest): Promise<void> => {
    const checkRuns = await octokit.checks
}

export const createCheckRun = async (context: UnresolvedActionContext, octokit: OctokitInstance, pullRequest: PullRequest): Promise<number> => {
    const checkRun = await octokit.checks.create({
        owner: context.repoOwner,
        repo: context.repoName,
        head_sha: pullRequest.head.sha,
        name: "Unresolved Review Threads",
        status: "in_progress",
        started_at: new Date().toISOString(),
    })
    return checkRun.data.id
}

export const concludeCheckRun = async (context: UnresolvedActionContext, octokit: OctokitInstance, checkRunId: number, conclusion: "failure" | "success") => await octokit.checks.update({
    owner: context.repoOwner,
    repo: context.repoName,
    check_run_id: checkRunId,
    status: "completed",
    conclusion,
})
