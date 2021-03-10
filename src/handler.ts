import * as github from "@actions/github";
import {scanPullRequestForUnresolvedReviewThreads, UnresolvedThreads} from "@/src/unresolvedThread";
import {getContext, UnresolvedActionContext} from "@/src/context";
import {OctokitInstance} from "@/src/octokitInstance";
import {deleteComment, findComment} from "@/src/comment";
import {addLabel, removeLabel} from "@/src/label";
import {setCheckStatusAsFailure, setCheckStatusAsSuccess} from "@/src/status";

const deleteSynchronisationCommentTrigger = async (context: UnresolvedActionContext, octokit: OctokitInstance) => {
    const commentIdToDelete = await findComment(octokit, context.repoOwner, context.repoName, context.pullRequest.number, context.resolvedCommentTrigger)
    if (commentIdToDelete != null) await deleteComment(octokit, context.repoOwner, context.repoName, commentIdToDelete)
}

const checkForUnresolvedThreads = async (context: UnresolvedActionContext, octokit: OctokitInstance): Promise<UnresolvedThreads> => {
    const unresolvedThreads = await scanPullRequestForUnresolvedReviewThreads(octokit, context.repoOwner, context.repoName, context.pullRequest.number)
    console.log(`Number of Unresolved Review Threads: ${unresolvedThreads.numberOfUnresolved}`)
    return unresolvedThreads
}

const reportUnresolvedThreads = async (context: UnresolvedActionContext, octokit: OctokitInstance, numberOfUnresolved: number) => {
    await addLabel(octokit, context.repoOwner, context.repoName, context.pullRequest, context.unresolvedLabel)
    console.log("Failure - It seems there are some unresolved review threads!")
    await setCheckStatusAsFailure(octokit, context, numberOfUnresolved)
}

const reportNoUnresolvedThreads = async (context: UnresolvedActionContext, octokit: OctokitInstance) => {
    await removeLabel(octokit, context.repoOwner, context.repoName, context.pullRequest, context.unresolvedLabel)
    console.log("Success - No unresolved review threads")
    await setCheckStatusAsSuccess(octokit, context)
}

export const handleEvent = async () => {
    const context = getContext()
    const octokit = github.getOctokit(context.token)
    await deleteSynchronisationCommentTrigger(context, octokit)
    const { anyUnresolved, numberOfUnresolved } = await checkForUnresolvedThreads(context, octokit)
    anyUnresolved ? await reportUnresolvedThreads(context, octokit, numberOfUnresolved) : await reportNoUnresolvedThreads(context, octokit)
}
