import * as github from "@actions/github";
import {scanPullRequestForUnresolvedReviewThreads, UnresolvedThreads} from "@/src/unresolvedThread";
import {getContext, UnresolvedActionContext} from "@/src/context";
import {OctokitInstance} from "@/src/octokitInstance";
import {produceSummary} from "@/src/summary";
import {createComment, deleteComment, findComment} from "@/src/comment";
import {addLabel, removeLabel} from "@/src/label";
import {EventCategory} from "@/src/eventCategory";
import {concludeCheckRun, createCheckRun} from "@/src/checkRun";

// const SYNCHRONISATION_LABEL = 'syncUnresolved'

// const addSynchronisationLabel = async (context: UnresolvedActionContext, octokit: OctokitInstance) => {
//     await addLabel(octokit, context.repoOwner, context.repoName, context.pullRequest, SYNCHRONISATION_LABEL)
// }

// const removeSynchronisationLabel = async (context: UnresolvedActionContext, octokit: OctokitInstance) => {
//     await removeLabel(octokit, context.repoOwner, context.repoName, context.pullRequest, SYNCHRONISATION_LABEL)
// }

const deleteSynchronisationComment = async (context: UnresolvedActionContext, octokit: OctokitInstance) => {
    const commentIdToDelete = await findComment(octokit, context.repoOwner, context.repoName, context.pullRequest.number, context.resolvedCommentTrigger)
    if (commentIdToDelete != null) await deleteComment(octokit, context.repoOwner, context.repoName, commentIdToDelete)
}

const cleanUpSynchronisationTrigger = async (context: UnresolvedActionContext, octokit: OctokitInstance) => {
    // await removeSynchronisationLabel(context, octokit)
    await deleteSynchronisationComment(context, octokit)
}

const checkForUnresolvedThreads = async (context: UnresolvedActionContext, octokit: OctokitInstance): Promise<UnresolvedThreads> => {
    const unresolvedThreads = await scanPullRequestForUnresolvedReviewThreads(octokit, context.repoOwner, context.repoName, context.pullRequest.number)
    console.log(`Number of Unresolved Review Threads: ${unresolvedThreads.numberOfUnresolved}`)
    return unresolvedThreads
}

const reportUnresolvedThreads = async (context: UnresolvedActionContext, octokit: OctokitInstance, checkRunId: number, numberOfUnresolved: number) => {
    const summary = produceSummary(numberOfUnresolved)
    await createComment(octokit, context.repoOwner, context.repoName, context.pullRequest.number, summary)
    await addLabel(octokit, context.repoOwner, context.repoName, context.pullRequest, context.unresolvedLabel)
    console.log("Failure - It seems there are some unresolved review threads!")
    // setFailed("Presence of unresolved review threads")
    await concludeCheckRun(context, octokit, checkRunId, "failure")
}

const reportNoUnresolvedThreads = async (context: UnresolvedActionContext, octokit: OctokitInstance, checkRunId: number) => {
    if (context.deleteResolvedCommentTrigger) {
        // TODO: remove summary comment if needed
        const commentIdToDelete = await findComment(octokit, context.repoOwner, context.repoName, context.pullRequest.number, '')
        if (commentIdToDelete != null) await deleteComment(octokit, context.repoOwner, context.repoName, commentIdToDelete)
    }
    await removeLabel(octokit, context.repoOwner, context.repoName, context.pullRequest, context.unresolvedLabel)
    console.log("Success - No unresolved review threads")
    await concludeCheckRun(context, octokit, checkRunId, "success")
}

export const handleEvent = async () => {
    const context = getContext()
    const octokit = github.getOctokit(context.token)
    switch (context.eventCategory) {
        case EventCategory.ISSUE_COMMENT_CREATED:
        case EventCategory.PULL_REQUEST_REVIEW_COMMENT_CREATED:
        case EventCategory.PULL_REQUEST_REVIEW_COMMENT_EDITED:
        case EventCategory.PULL_REQUEST_REVIEW_COMMENT_DELETED:
        case EventCategory.PULL_REQUEST_OPENED:
        case EventCategory.PULL_REQUEST_REOPENED:
        case EventCategory.PULL_REQUEST_LABELED:
        case EventCategory.PULL_REQUEST_UNLABELED:
            const checkRunId = await createCheckRun(context, octokit, context.pullRequest)
            await cleanUpSynchronisationTrigger(context, octokit)
            const { anyUnresolved, numberOfUnresolved } = await checkForUnresolvedThreads(context, octokit)
            anyUnresolved ? await reportUnresolvedThreads(context, octokit, checkRunId, numberOfUnresolved) : await reportNoUnresolvedThreads(context, octokit, checkRunId)
            break
    }
}
