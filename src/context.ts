import * as core from "@actions/core";
import * as github from "@actions/github";
import {PullRequest} from "@/src/pullRequest";
import {RestEndpointMethodTypes} from "@octokit/rest";
import {OctokitInstance} from "@/src/octokitInstance";
import {TriggerType} from "@/src/triggerType";
import {EventType, eventTypeFrom} from "@/src/eventType";

const DEFAULT_VALUE_USE_LABEL_TRIGGER = 'true';
const DEFAULT_VALUE_UNRESOLVED_LABEL = 'unresolvedThreads';
const DEFAULT_VALUE_USE_COMMENT_TRIGGER = 'false';
const DEFAULT_VALUE_RESOLVED_COMMENT_TRIGGER = 'LGTM';
const DEFAULT_VALUE_DELETE_RESOLVED_COMMENT_TRIGGER = 'true';

type GitHubContextPullRequest = RestEndpointMethodTypes['pulls']['get']['response']['data']

type CommonContext = Readonly<{
   // inputs
   useLabelTrigger: boolean,
   unresolvedLabel: string,
   useCommentTrigger: boolean,
   resolvedCommentTrigger: string,
   deleteResolvedCommentTrigger: boolean,
   // event
   eventType: EventType,
   triggerType: TriggerType,
   runId: number,
   workflowName: string,
   jobName: string,
   repoOwner: string,
   repoName: string,
   labelTriggeredEvent: boolean,
   commentTriggeredEvent: boolean,
   shouldProcessEvent: boolean,
}>

export type CommentCreatedContext = CommonContext & Readonly<{
   eventType: EventType.ISSUE_COMMENT_CREATED
   commentId: number,
   commentBody: string,
   pullRequest?: PullRequest,
}>

export type PullRequestContext = CommonContext & Readonly<{
   pullRequest: PullRequest
}>

export type UnresolvedActionContext = CommentCreatedContext | PullRequestContext

const getBooleanInput = (inputName: string, defaultValue: 'true' | 'false'): boolean => {
   const input = core.getInput(inputName) || defaultValue
   if(!['true', 'false'].includes(input)) {
      console.log(`boolean input: ${input}`)
      // console.log(`Failure - Invalid value for ${inputName}`)
      // setFailed(`Invalid ${inputName}`)
      throw new Error(`Invalid ${inputName}`)
   }
   return input === 'true'
}

const getUseLabelTrigger = (): boolean => {
   return getBooleanInput('useLabelTrigger', DEFAULT_VALUE_USE_LABEL_TRIGGER)
}

const getUnresolvedLabel = (useLabelTrigger: boolean) : string => {
   let input = core.getInput('unresolvedLabel');
   if(!useLabelTrigger && input !== '') throw new Error("Can't define a unresolved label if use of label trigger is disabled")
   return input || DEFAULT_VALUE_UNRESOLVED_LABEL
}

const getUseCommentTrigger = (): boolean => {
   return getBooleanInput('useCommentTrigger', DEFAULT_VALUE_USE_COMMENT_TRIGGER)
}

const getResolvedCommentTrigger = (useCommentTrigger: boolean) : string => {
   let input = core.getInput('resolvedCommentTrigger');
   if(!useCommentTrigger && input !== '') throw new Error("Can't define a resolved comment trigger if use of comment trigger is disabled")
   return input || DEFAULT_VALUE_RESOLVED_COMMENT_TRIGGER
}

const getDeleteResolvedCommentTrigger = (useCommentTrigger: boolean): boolean => {
   let input = core.getInput('resolvedCommentTrigger');
   if(!useCommentTrigger && input !== '') throw new Error("Can't activate deletion of resolved comment trigger if use of comment trigger is disabled")
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

const getCommentCreatedPullRequest = async (octokit: OctokitInstance, repoOwner: string, repoName: string): Promise<PullRequest | undefined> => {
   if(github.context.payload.issue?.pull_request == null) {
      return undefined
   }
   const pullRequestNumber = github.context.payload.issue!.number
   const pullRequest = await octokit.pulls.get({owner: repoOwner, repo: repoName, pull_number: pullRequestNumber})
   return {
      number: pullRequestNumber,
      headRef: pullRequest.data.head.sha,
      labels: pullRequest.data.labels,
   }
}

const getPullRequest = (): PullRequest => {
   const pullRequest = github.context.payload.pull_request as GitHubContextPullRequest;
   if (pullRequest == null) {
      // console.log('Failure - There is no pull request associated to the event payload')
      // setFailed('Pull request undefined')
      throw new Error('No associated pull request')
   }
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

const isLabelTriggeredEvent = (triggerType: TriggerType): boolean => {
   return triggerType === 'label'
}

const isCommentTriggeredEvent = (triggerType: TriggerType, commentBody: string, resolvedCommentTrigger: string, pullRequest: PullRequest | undefined): boolean => {
   if (triggerType === 'comment') {
      return commentBody === resolvedCommentTrigger && pullRequest != null
   }
   return false
}

export const getContext = async (octokit: OctokitInstance): Promise<UnresolvedActionContext> => {
   console.log(JSON.stringify(github.context, null, 2))

   const useLabelTrigger = getUseLabelTrigger();
   const unresolvedLabel = getUnresolvedLabel(useLabelTrigger);
   const useCommentTrigger = getUseCommentTrigger();
   const resolvedCommentTrigger = getResolvedCommentTrigger(useCommentTrigger);
   const deleteResolvedCommentTrigger = getDeleteResolvedCommentTrigger(useCommentTrigger);
   const eventType = getEventType()
   const triggerType = getTriggerType(eventType)
   const runId = getRunId();
   const workflowName = getWorkflowName();
   const jobName = getJobName();
   const repoOwner = getRepoOwner();
   const repoName = getRepoName();

   const commonContext:CommonContext = {
      useLabelTrigger,
      unresolvedLabel,
      useCommentTrigger,
      resolvedCommentTrigger,
      deleteResolvedCommentTrigger,
      eventType,
      triggerType,
      runId,
      workflowName,
      jobName,
      repoOwner,
      repoName,
      labelTriggeredEvent: false,
      commentTriggeredEvent: false,
      shouldProcessEvent: false,
   }

   if (!commonContext.useLabelTrigger && !commonContext.useCommentTrigger) throw new Error("At least one type of trigger must be enabled")

   let context: UnresolvedActionContext

   if(triggerType === 'comment') {
      const pullRequest = await getCommentCreatedPullRequest(octokit, repoOwner, repoName)
      const commentId = getCommentId();
      const commentBody = getCommentBody();
      const commentTriggeredEvent = isCommentTriggeredEvent(triggerType, commentBody, resolvedCommentTrigger, pullRequest);
      context = {
         ...commonContext,
         pullRequest,
         commentId,
         commentBody,
         commentTriggeredEvent: commentTriggeredEvent,
         shouldProcessEvent: useCommentTrigger && commentTriggeredEvent,
      } as CommentCreatedContext
   } else {
      const pullRequest = getPullRequest();
      const labelTriggeredEvent = isLabelTriggeredEvent(triggerType);
      context = {
         ...commonContext,
         pullRequest,
         labelTriggeredEvent,
         shouldProcessEvent: (useLabelTrigger && labelTriggeredEvent) || triggerType === 'other',
      } as PullRequestContext
   }

   console.log('Context')
   console.log(JSON.stringify(context, null, 2))

   return context
}