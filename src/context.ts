import * as core from "@actions/core";
import * as github from "@actions/github";
import {setFailed} from "@actions/core";
import {EventCategory} from "@/src/eventCategory";
import {PullRequest} from "@/src/PullRequest";

export type UnresolvedActionContext = {
   // env
   token: string,
   // inputs
   unresolvedLabel: string,
   resolvedCommentTrigger: string,
   deleteResolvedCommentTrigger: boolean,
   // event
   eventCategory: EventCategory,
   repoOwner: string,
   repoName: string,
   pullRequest: PullRequest,
}

const getToken = (): string => {
   const token = process.env.GITHUB_TOKEN

   if(token == null) {
      console.log("Failure - No token provided")
      setFailed('Undefined GITHUB_TOKEN')
   }

   return token!
}

const getUnresolvedLabel = () : string => {
   return core.getInput('unresolvedLabel')
}

const getResolvedCommentTrigger = () : string => {
   return core.getInput('resolvedCommentTrigger')
}

const getDeleteResolvedCommentTrigger = (): boolean => {
   const input = core.getInput('deleteResolvedCommentTrigger')
   if(!['true', 'false'].includes(input)) {
      console.log("Failure - Invalid value for deleteResolvedCommentTrigger")
      setFailed('Invalid deleteResolvedCommentTrigger')
   }
   return input === 'true'
}

const getEventCategory = (): EventCategory => {
   const eventName = github.context.eventName
   const eventType = github.context.job
   const eventCategory = EventCategory.from(eventName, eventType)
   if (eventCategory == null) {
      console.log('Failure - Unknown event name and action combination')
      setFailed('Unknown event name and action combination')
   }
   return eventCategory!
}

const getRepoOwner = (): string => {
   return github.context.repo.owner
}

const getRepoName = (): string => {
   return github.context.repo.repo
}

const getPullRequest = (): PullRequest => {
   const pullRequest = github.context.payload.pull_request as PullRequest;
   if (pullRequest == null) {
      console.log('Failure - There is no pull request associated to the event payload')
      setFailed('Pull request undefined')
   }
   return pullRequest!
}

export const getContext = (): UnresolvedActionContext => {
   // console.log(`Event: ${github.context.eventName}`)
   console.log(JSON.stringify(github.context))

   const token = getToken()
   const unresolvedLabel = getUnresolvedLabel()
   const resolvedCommentTrigger = getResolvedCommentTrigger()
   const deleteResolvedCommentTrigger = getDeleteResolvedCommentTrigger()
   const eventCategory = getEventCategory()
   const repoOwner = getRepoOwner()
   const repoName = getRepoName()
   const pullRequest = getPullRequest()

   // console.log(`Repository Owner: ${repoOwner}`)
   // console.log(`Repository Name: ${repoName}`)
   // console.log(`Pull Request Number: ${pullRequest.number}`)

   return {
      token,
      unresolvedLabel,
      resolvedCommentTrigger,
      deleteResolvedCommentTrigger,
      eventCategory,
      repoOwner,
      repoName,
      pullRequest,
   }
}