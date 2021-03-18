/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as core from '@actions/core'
import * as github from '@actions/github'

import { NoAssociatedPullRequestError } from '@/src/error/noAssociatedPullRequestError'
import { EventType, eventTypeFrom } from '@/src/eventType'
import { LoggingService } from '@/src/loggingService'
import { OctokitClient } from '@/src/octokitClient'
import { getPullRequest, PullRequest } from '@/src/pullRequest'

export type UnresolvedActionContext = Readonly<{
  // inputs
  unresolvedLabel: string
  bypassLabel: string
  // github
  eventType: EventType
  runId: number
  workflowName: string
  jobName: string
  repoOwner: string
  repoName: string
  // processed
  pullRequest: PullRequest
}>

const UNRESOLVED_LABEL_DEFAULT_VALUE = 'unresolvedThreads'
const BYPASS_LABEL_DEFAULT_VALUE = 'ignoreUnresolved'

const getUnresolvedLabel = (): string =>
  core.getInput('unresolvedLabel') || UNRESOLVED_LABEL_DEFAULT_VALUE
const getBypassLabel = (): string => core.getInput('bypassLabel') || BYPASS_LABEL_DEFAULT_VALUE

const parseInputs = () => ({
  unresolvedLabel: getUnresolvedLabel(),
  bypassLabel: getBypassLabel(),
})

const getEventType = (): EventType => {
  const eventName = github.context.eventName
  const eventAction = github.context.payload.action!
  return eventTypeFrom(eventName, eventAction)
}

const getRunId = (): number => github.context.runId
const getWorkflowName = (): string => github.context.workflow
const getJobName = (): string => github.context.job
const getRepoOwner = (): string => github.context.repo.owner
const getRepoName = (): string => github.context.repo.repo

const getPullRequestNumber = (): number => {
  const pullRequestNumber = github.context.payload.pull_request?.number
  if (pullRequestNumber == null) throw new NoAssociatedPullRequestError()
  return pullRequestNumber
}

const parseGitHubContext = () => ({
  eventType: getEventType(),
  runId: getRunId(),
  workflowName: getWorkflowName(),
  jobName: getJobName(),
  repoOwner: getRepoOwner(),
  repoName: getRepoName(),
  pullRequestNumber: getPullRequestNumber(),
})

export const getContext = async (
  loggingService: LoggingService,
  octokit: OctokitClient,
): Promise<UnresolvedActionContext> => {
  await loggingService.debug('GitHub Context', JSON.stringify(github.context, null, 2))
  const inputs = parseInputs()
  const ghContext = parseGitHubContext()
  const pullRequest = await getPullRequest(
    octokit,
    ghContext.repoOwner,
    ghContext.repoName,
    ghContext.pullRequestNumber,
  )
  const context: UnresolvedActionContext = { ...inputs, ...ghContext, pullRequest }
  await loggingService.debug('Action Context', JSON.stringify(context, null, 2))
  return context
}
