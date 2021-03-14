import { PullRequestContext } from '@/src/context'
import { OctokitClient } from '@/src/octokitClient'

const setCheckStatus = async (
  octokit: OctokitClient,
  context: PullRequestContext,
  state: 'success' | 'failure',
  description: string,
) => {
  await octokit.repos.createCommitStatus({
    owner: context.repoOwner,
    repo: context.repoName,
    sha: context.pullRequest.headRef,
    state,
    context: 'Unresolved Review Threads',
    description,
    target_url: `https://github.com/${context.repoOwner}/${context.repoName}/actions/runs/${context.runId}`,
  })
}

export const setCheckStatusAsSuccess = async (
  octokit: OctokitClient,
  context: PullRequestContext,
): Promise<void> => {
  await setCheckStatus(octokit, context, 'success', 'no unresolved thread found')
}

export const setCheckStatusAsFailure = async (
  octokit: OctokitClient,
  context: PullRequestContext,
  numberOfUnresolvedThreads: number,
): Promise<void> => {
  await setCheckStatus(
    octokit,
    context,
    'failure',
    `${numberOfUnresolvedThreads} unresolved threads found`,
  )
}
