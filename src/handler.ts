import * as core from '@actions/core'

import { getContext, UnresolvedActionContext } from '@/src/context'
import { BaseError } from '@/src/error/baseError'
import { addLabel, hasLabel, removeLabel } from '@/src/label'
import { LoggingService } from '@/src/loggingService'
import { OctokitClient } from '@/src/octokitClient'
import { setCheckStatusAsFailure, setCheckStatusAsSuccess } from '@/src/status'
import {
  scanPullRequestForUnresolvedReviewThreads,
  UnresolvedThreads,
} from '@/src/unresolvedThread'

const bypassCheck = async (
  loggingService: LoggingService,
  octokit: OctokitClient,
  context: UnresolvedActionContext,
): Promise<void> => {
  await loggingService.info(
    'Bypass label found on the pull request',
    'Unresolved Threads Check Skipped',
  )
  await setCheckStatusAsSuccess(octokit, context)
  await loggingService.info('Success status check added to pull request')
}

const checkForUnresolvedThreads = async (
  loggingService: LoggingService,
  context: UnresolvedActionContext,
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
  context: UnresolvedActionContext,
  octokit: OctokitClient,
  numberOfUnresolved: number,
) => {
  await addLabel(
    octokit,
    context.repoOwner,
    context.repoName,
    context.pullRequest,
    context.unresolvedLabel,
  )
  await loggingService.info('Unresolved label trigger added to pull request')
  await setCheckStatusAsFailure(octokit, context, numberOfUnresolved)
  await loggingService.info('Fail status check added to pull request')
}

const reportNoUnresolvedThreads = async (
  loggingService: LoggingService,
  context: UnresolvedActionContext,
  octokit: OctokitClient,
) => {
  await removeLabel(
    octokit,
    context.repoOwner,
    context.repoName,
    context.pullRequest,
    context.unresolvedLabel,
  )
  await loggingService.info('Unresolved label trigger removed from pull request')
  await setCheckStatusAsSuccess(octokit, context)
  await loggingService.info('Success status check added to pull request')
}

const performCheck = async (
  loggingService: LoggingService,
  octokit: OctokitClient,
  context: UnresolvedActionContext,
): Promise<void> => {
  const { anyUnresolved, numberOfUnresolved } = await checkForUnresolvedThreads(
    loggingService,
    context,
    octokit,
  )
  anyUnresolved
    ? await reportUnresolvedThreads(loggingService, context, octokit, numberOfUnresolved)
    : await reportNoUnresolvedThreads(loggingService, context, octokit)
}

export const handleEvent = async (
  loggingService: LoggingService,
  octokit: OctokitClient,
): Promise<void> => {
  const context = await getContext(loggingService, octokit)
  hasLabel(context.pullRequest, context.bypassLabel)
    ? await bypassCheck(loggingService, octokit, context)
    : await performCheck(loggingService, octokit, context)
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
