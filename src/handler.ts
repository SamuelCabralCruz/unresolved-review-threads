import {scanPullRequestForUnresolvedReviewThreads, UnresolvedThreads} from "@/src/unresolvedThread";
import {CommentCreatedContext, getContext, PullRequestContext} from "@/src/context";
import {OctokitInstance} from "@/src/octokitInstance";
import {deleteComment} from "@/src/comment";
import {addLabel, removeLabel} from "@/src/label";
import {setCheckStatusAsFailure, setCheckStatusAsSuccess} from "@/src/status";
import {LoggingService} from "@/src/loggingService";

const deleteSynchronisationCommentTrigger = async (loggingService: LoggingService, context: CommentCreatedContext, octokit: OctokitInstance) => {
    if (context.deleteResolvedCommentTrigger != null) {
        await deleteComment(octokit, context.repoOwner, context.repoName, context.commentId)
        await loggingService.info(`Deleting synchronisation comment trigger with id ${context.commentId}`)
    }
}

const checkForUnresolvedThreads = async (loggingService: LoggingService, context: PullRequestContext, octokit: OctokitInstance): Promise<UnresolvedThreads> => {
    const unresolvedThreads = await scanPullRequestForUnresolvedReviewThreads(octokit, context.repoOwner, context.repoName, context.pullRequest.number)
    await loggingService.info(`Number of unresolved review threads found: ${unresolvedThreads.numberOfUnresolved}`)
    return unresolvedThreads
}

const reportUnresolvedThreads = async (loggingService: LoggingService, context: PullRequestContext, octokit: OctokitInstance, numberOfUnresolved: number) => {
    if(context.useLabelTrigger) {
        await addLabel(octokit, context.repoOwner, context.repoName, context.pullRequest, context.unresolvedLabel)
        await loggingService.info('Unresolved label trigger added to pull request')
    }
    await setCheckStatusAsFailure(octokit, context, numberOfUnresolved)
    await loggingService.info('Fail status check added to pull request')
}

const reportNoUnresolvedThreads = async (loggingService: LoggingService, context: PullRequestContext, octokit: OctokitInstance) => {
    if(context.useLabelTrigger) {
        await removeLabel(octokit, context.repoOwner, context.repoName, context.pullRequest, context.unresolvedLabel)
        await loggingService.info('Unresolved label trigger removed from pull request')
    }
    await setCheckStatusAsSuccess(octokit, context)
    await loggingService.info('Success status check added to pull request')
}

export const handleEvent = async (loggingService: LoggingService, octokit: OctokitInstance) => {
    const context = await getContext(loggingService, octokit)
    if (!context.shouldProcessEvent) {
        await loggingService.info('Event does not match process requirements', 'Terminating process')
        return
    }
    if(context.commentTriggeredEvent) await deleteSynchronisationCommentTrigger(loggingService, context as CommentCreatedContext, octokit)
    const { anyUnresolved, numberOfUnresolved } = await checkForUnresolvedThreads(loggingService, context as PullRequestContext, octokit)
    anyUnresolved ? await reportUnresolvedThreads(loggingService, context as PullRequestContext, octokit, numberOfUnresolved) : await reportNoUnresolvedThreads(loggingService, context as PullRequestContext, octokit)
}
