import * as core from '@actions/core'

import { deleteComment } from '@/src/comment'
import { CommentCreatedContext, getContext, PullRequestContext } from '@/src/context'
import { BaseError } from '@/src/error/baseError'
import { addLabel, removeLabel } from '@/src/label'
import { LoggingService } from '@/src/loggingService'
import { OctokitClient } from '@/src/octokitClient'
import { setCheckStatusAsFailure, setCheckStatusAsSuccess } from '@/src/status'
import {
  scanPullRequestForUnresolvedReviewThreads,
  UnresolvedThreads,
} from '@/src/unresolvedThread'

const deleteSynchronisationCommentTrigger = async (
  loggingService: LoggingService,
  context: CommentCreatedContext,
  octokit: OctokitClient,
) => {
  if (context.deleteResolvedCommentTrigger != null) {
    await deleteComment(octokit, context.repoOwner, context.repoName, context.commentId)
    await loggingService.info(
      `Deleting synchronisation comment trigger with id ${context.commentId}`,
    )
  }
}

const checkForUnresolvedThreads = async (
  loggingService: LoggingService,
  context: PullRequestContext,
  octokit: OctokitClient,
): Promise<UnresolvedThreads> => {
  const unresolvedThreads = await scanPullRequestForUnresolvedReviewThreads(
    loggingService,
    octokit,
    context.repoOwner,
    context.repoName,
    context.pullRequest.number,
  )
  await loggingService.info(
    `Number of unresolved review threads found: ${unresolvedThreads.numberOfUnresolved}`,
  )
  return unresolvedThreads
}

const reportUnresolvedThreads = async (
  loggingService: LoggingService,
  context: PullRequestContext,
  octokit: OctokitClient,
  numberOfUnresolved: number,
) => {
  if (context.useLabelTrigger) {
    await addLabel(
      octokit,
      context.repoOwner,
      context.repoName,
      context.pullRequest,
      context.unresolvedLabel,
    )
    await loggingService.info('Unresolved label trigger added to pull request')
  }
  await setCheckStatusAsFailure(octokit, context, numberOfUnresolved)
  await loggingService.info('Fail status check added to pull request')
}

const reportNoUnresolvedThreads = async (
  loggingService: LoggingService,
  context: PullRequestContext,
  octokit: OctokitClient,
) => {
  if (context.useLabelTrigger) {
    await removeLabel(
      octokit,
      context.repoOwner,
      context.repoName,
      context.pullRequest,
      context.unresolvedLabel,
    )
    await loggingService.info('Unresolved label trigger removed from pull request')
  }
  await setCheckStatusAsSuccess(octokit, context)
  await loggingService.info('Success status check added to pull request')
}

export const handleEvent = async (
  loggingService: LoggingService,
  octokit: OctokitClient,
): Promise<void> => {
  const context = await getContext(loggingService, octokit)
  if (!context.shouldProcessEvent) {
    await loggingService.info('Event does not match process requirements', 'Terminating process')
    return
  }
  if (context.commentTriggeredEvent)
    await deleteSynchronisationCommentTrigger(
      loggingService,
      context as CommentCreatedContext,
      octokit,
    )
  const { anyUnresolved, numberOfUnresolved } = await checkForUnresolvedThreads(
    loggingService,
    context as PullRequestContext,
    octokit,
  )
  anyUnresolved
    ? await reportUnresolvedThreads(
        loggingService,
        context as PullRequestContext,
        octokit,
        numberOfUnresolved,
      )
    : await reportNoUnresolvedThreads(loggingService, context as PullRequestContext, octokit)
}

export const handleError = async (loggingService: LoggingService, error: Error): Promise<void> => {
  if (error instanceof BaseError) {
    await loggingService.error(error)
    core.setFailed(error.description)
  } else {
    core.error(JSON.stringify(error.stack, null, 2))
    core.setFailed('Unexpected Error')
  }
}
