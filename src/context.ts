/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as core from '@actions/core'
import * as github from '@actions/github'
import { RestEndpointMethodTypes } from '@octokit/rest'

import { AtLeastOneTriggerOptionEnabledError } from '@/src/error/atLeastOneTriggerOptionEnabledError'
import { DefinedDeleteResolvedCommentWithDisabledTriggerError } from '@/src/error/definedDeleteResolvedCommentWithDisabledTriggerError'
import { DefinedResolvedCommentWithDisabledTriggerError } from '@/src/error/definedResolvedCommentWithDisabledTriggerError'
import { DefinedUnresolvedLabelWithDisabledTriggerError } from '@/src/error/definedUnresolvedLabelWithDisabledTriggerError'
import { InvalidBooleanInputError } from '@/src/error/invalidBooleanInputError'
import { NoAssociatedPullRequestError } from '@/src/error/noAssociatedPullRequestError'
import { EventType, eventTypeFrom } from '@/src/eventType'
import { LoggingService } from '@/src/loggingService'
import { OctokitClient } from '@/src/octokitClient'
import { getPullRequest, PullRequest } from '@/src/pullRequest'
import { TriggerType } from '@/src/triggerType'

const DEFAULT_VALUE_USE_LABEL_TRIGGER = 'true'
const DEFAULT_VALUE_UNRESOLVED_LABEL = 'unresolvedThreads'
const DEFAULT_VALUE_USE_COMMENT_TRIGGER = 'false'
const DEFAULT_VALUE_RESOLVED_COMMENT_TRIGGER = 'LGTM'
const DEFAULT_VALUE_DELETE_RESOLVED_COMMENT_TRIGGER = 'true'

type GitHubContextPullRequest = RestEndpointMethodTypes['pulls']['get']['response']['data']

type CommonContext = Readonly<{
  // inputs
  useLabelTrigger: boolean
  unresolvedLabel: string
  useCommentTrigger: boolean
  resolvedCommentTrigger: string
  deleteResolvedCommentTrigger: boolean
  // event
  eventType: EventType
  triggerType: TriggerType
  runId: number
  workflowName: string
  jobName: string
  repoOwner: string
  repoName: string
  labelTriggeredEvent: boolean
  commentTriggeredEvent: boolean
  shouldProcessEvent: boolean
}>

export type CommentCreatedContext = CommonContext &
  Readonly<{
    eventType: EventType.ISSUE_COMMENT_CREATED
    commentId: number
    commentBody: string
    pullRequest?: PullRequest
  }>

export type PullRequestContext = CommonContext &
  Readonly<{
    pullRequest: PullRequest
  }>

export type UnresolvedActionContext = CommentCreatedContext | PullRequestContext

const getBooleanInput = (inputName: string, defaultValue: 'true' | 'false'): boolean => {
  const inputValue = core.getInput(inputName) || defaultValue
  if (!['true', 'false'].includes(inputValue))
    throw new InvalidBooleanInputError(inputName, inputValue)
  return inputValue === 'true'
}

const getUseLabelTrigger = (): boolean => {
  return getBooleanInput('useLabelTrigger', DEFAULT_VALUE_USE_LABEL_TRIGGER)
}

const getUnresolvedLabel = (useLabelTrigger: boolean): string => {
  const input = core.getInput('unresolvedLabel')
  if (!useLabelTrigger && input !== '') throw new DefinedUnresolvedLabelWithDisabledTriggerError()
  return input || DEFAULT_VALUE_UNRESOLVED_LABEL
}

const getUseCommentTrigger = (): boolean => {
  return getBooleanInput('useCommentTrigger', DEFAULT_VALUE_USE_COMMENT_TRIGGER)
}

const getResolvedCommentTrigger = (resolvedCommentTrigger: boolean): string => {
  const input = core.getInput('resolvedCommentTrigger')
  if (!resolvedCommentTrigger && input !== '')
    throw new DefinedResolvedCommentWithDisabledTriggerError()
  return input || DEFAULT_VALUE_RESOLVED_COMMENT_TRIGGER
}

const getDeleteResolvedCommentTrigger = (deleteResolvedCommentTrigger: boolean): boolean => {
  const input = core.getInput('deleteResolvedCommentTrigger')
  if (!deleteResolvedCommentTrigger && input !== '')
    throw new DefinedDeleteResolvedCommentWithDisabledTriggerError()
  return (input || DEFAULT_VALUE_DELETE_RESOLVED_COMMENT_TRIGGER) === 'true'
}

const getEventType = (): EventType => {
  const eventName = github.context.eventName
  const eventAction = github.context.payload.action!
  return eventTypeFrom(eventName, eventAction)
}

const getTriggerType = (eventType: EventType): TriggerType => {
  switch (eventType) {
    case EventType.ISSUE_COMMENT_CREATED:
      return 'comment'
    case EventType.PULL_REQUEST_LABELED:
    case EventType.PULL_REQUEST_UNLABELED:
      return 'label'
    default:
      return 'other'
  }
}

const getRunId = (): number => {
  return github.context.runId
}

const getWorkflowName = (): string => {
  return github.context.workflow
}

const getJobName = (): string => {
  return github.context.job
}

const getRepoOwner = (): string => {
  return github.context.repo.owner
}

const getRepoName = (): string => {
  return github.context.repo.repo
}

const getCommonContext = () => {
  const useLabelTrigger = getUseLabelTrigger()
  const unresolvedLabel = getUnresolvedLabel(useLabelTrigger)
  const useCommentTrigger = getUseCommentTrigger()
  const resolvedCommentTrigger = getResolvedCommentTrigger(useCommentTrigger)
  const deleteResolvedCommentTrigger = getDeleteResolvedCommentTrigger(useCommentTrigger)
  const eventType = getEventType()
  const commonContext = {
    useLabelTrigger,
    unresolvedLabel,
    useCommentTrigger,
    resolvedCommentTrigger,
    deleteResolvedCommentTrigger,
    eventType,
    triggerType: getTriggerType(eventType),
    runId: getRunId(),
    workflowName: getWorkflowName(),
    jobName: getJobName(),
    repoOwner: getRepoOwner(),
    repoName: getRepoName(),
    labelTriggeredEvent: getTriggerType(eventType) === 'label',
    commentTriggeredEvent: getTriggerType(eventType) === 'comment',
    shouldProcessEvent: false,
  }
  return { commonContext, ...commonContext }
}

const getCommentCreatedPullRequest = async (
  octokit: OctokitClient,
  repoOwner: string,
  repoName: string,
): Promise<PullRequest | undefined> => {
  if (github.context.payload.issue?.pull_request == null) {
    return undefined
  }
  const pullRequestNumber = github.context.payload.issue!.number
  return getPullRequest(octokit, repoOwner, repoName, pullRequestNumber)
}

const getEventPullRequest = (): PullRequest => {
  const pullRequest = github.context.payload.pull_request as GitHubContextPullRequest
  if (pullRequest == null) throw new NoAssociatedPullRequestError()
  return {
    number: pullRequest.number,
    headRef: pullRequest.head.sha,
    labels: pullRequest.labels,
  }
}

const getCommentId = (): number => {
  return github.context.payload.comment!.id
}

const getCommentBody = (): string => {
  return github.context.payload.comment!.body
}

const shouldProcessTriggeredEvent = (useLabelTrigger: boolean, triggerType: TriggerType): boolean =>
  (useLabelTrigger && triggerType === 'label') || triggerType === 'other'

const shouldProcessCommentTriggeredEvent = (
  useCommentTrigger: boolean,
  commentBody: string,
  resolvedCommentTrigger: string,
  pullRequest: PullRequest | undefined,
): boolean => useCommentTrigger && commentBody === resolvedCommentTrigger && pullRequest != null

async function getCommentCreatedContext(
  triggerType: 'comment',
  commonContext: CommonContext,
  octokit: OctokitClient,
  repoOwner: string,
  repoName: string,
  resolvedCommentTrigger: string,
  useCommentTrigger: boolean,
) {
  const pullRequest = await getCommentCreatedPullRequest(octokit, repoOwner, repoName)
  const commentId = getCommentId()
  const commentBody = getCommentBody()
  return {
    ...commonContext,
    pullRequest,
    commentId,
    commentBody,
    shouldProcessEvent: shouldProcessCommentTriggeredEvent(
      useCommentTrigger,
      commentBody,
      resolvedCommentTrigger,
      pullRequest,
    ),
  } as CommentCreatedContext
}

function getPullRequestContext(
  triggerType: TriggerType,
  commonContext: CommonContext,
  useLabelTrigger: boolean,
) {
  const pullRequest = getEventPullRequest()
  return {
    ...commonContext,
    pullRequest,
    shouldProcessEvent: shouldProcessTriggeredEvent(useLabelTrigger, triggerType),
  } as PullRequestContext
}

const verifyAtLeastOneTriggerOptionEnabled = (
  useLabelTrigger: boolean,
  useCommentTrigger: boolean,
) => {
  if (!useLabelTrigger && !useCommentTrigger) throw new AtLeastOneTriggerOptionEnabledError()
}

export const getContext = async (
  loggingService: LoggingService,
  octokit: OctokitClient,
): Promise<UnresolvedActionContext> => {
  await loggingService.debug('GitHub Context', JSON.stringify(github.context, null, 2))
  const {
    commonContext,
    useLabelTrigger,
    useCommentTrigger,
    resolvedCommentTrigger,
    triggerType,
    repoOwner,
    repoName,
  } = getCommonContext()
  const context: UnresolvedActionContext =
    triggerType === 'comment'
      ? await getCommentCreatedContext(
          triggerType,
          commonContext,
          octokit,
          repoOwner,
          repoName,
          resolvedCommentTrigger,
          useCommentTrigger,
        )
      : await getPullRequestContext(triggerType, commonContext, useLabelTrigger)
  await loggingService.debug('Action Context', JSON.stringify(context, null, 2))
  await verifyAtLeastOneTriggerOptionEnabled(
    commonContext.useLabelTrigger,
    commonContext.useCommentTrigger,
  )
  return context
}
