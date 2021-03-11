import {scanPullRequestForUnresolvedReviewThreads, UnresolvedThreads} from "@/src/unresolvedThread";
import {CommentCreatedContext, getContext, PullRequestContext} from "@/src/context";
import {OctokitInstance} from "@/src/octokitInstance";
import {deleteComment} from "@/src/comment";
import {addLabel, removeLabel} from "@/src/label";
import {setCheckStatusAsFailure, setCheckStatusAsSuccess} from "@/src/status";
import {getOctokit} from "@actions/github";

const getOctokitClient = (): OctokitInstance => {
    const token = process.env.GITHUB_TOKEN
    if(token == null) {
        // console.log("Failure - No token provided")
        // setFailed('Undefined GITHUB_TOKEN')
        throw new Error('Undefined GITHUB_TOKEN env variable')
    }
    return getOctokit(token)
}

const deleteSynchronisationCommentTrigger = async (context: CommentCreatedContext, octokit: OctokitInstance) => {
    if (context.deleteResolvedCommentTrigger != null) await deleteComment(octokit, context.repoOwner, context.repoName, context.commentId)
}

const checkForUnresolvedThreads = async (context: PullRequestContext, octokit: OctokitInstance): Promise<UnresolvedThreads> => {
    const unresolvedThreads = await scanPullRequestForUnresolvedReviewThreads(octokit, context.repoOwner, context.repoName, context.pullRequest.number)
    // console.log(`Number of Unresolved Review Threads: ${unresolvedThreads.numberOfUnresolved}`)
    return unresolvedThreads
}

const reportUnresolvedThreads = async (context: PullRequestContext, octokit: OctokitInstance, numberOfUnresolved: number) => {
    if(context.useLabelTrigger) await addLabel(octokit, context.repoOwner, context.repoName, context.pullRequest, context.unresolvedLabel)
    // console.log("Failure - It seems there are some unresolved review threads!")
    await setCheckStatusAsFailure(octokit, context, numberOfUnresolved)
}

const reportNoUnresolvedThreads = async (context: PullRequestContext, octokit: OctokitInstance) => {
    if(context.useLabelTrigger) await removeLabel(octokit, context.repoOwner, context.repoName, context.pullRequest, context.unresolvedLabel)
    // console.log("Success - No unresolved review threads")
    await setCheckStatusAsSuccess(octokit, context)
}

export const handleEvent = async () => {
    const octokit = getOctokitClient()
    // TODO: instantiate logging service
    const context = await getContext(octokit)
    if (!context.shouldProcessEvent) return
    if(context.commentTriggeredEvent) await deleteSynchronisationCommentTrigger(context as CommentCreatedContext, octokit)
    const { anyUnresolved, numberOfUnresolved } = await checkForUnresolvedThreads(context as PullRequestContext, octokit)
    anyUnresolved ? await reportUnresolvedThreads(context as PullRequestContext, octokit, numberOfUnresolved) : await reportNoUnresolvedThreads(context as PullRequestContext, octokit)
}
