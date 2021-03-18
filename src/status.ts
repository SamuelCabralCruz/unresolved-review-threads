import { UnresolvedActionContext } from '@/src/context'
import { OctokitClient } from '@/src/octokitClient'

const setCheckStatus = async (
  octokit: OctokitClient,
  context: UnresolvedActionContext,
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
  context: UnresolvedActionContext,
): Promise<void> => {
  await setCheckStatus(octokit, context, 'success', 'no unresolved thread found')
}

export const setCheckStatusAsFailure = async (
  octokit: OctokitClient,
  context: UnresolvedActionContext,
  numberOfUnresolvedThreads: number,
): Promise<void> => {
  await setCheckStatus(
    octokit,
    context,
    'failure',
    `${numberOfUnresolvedThreads} unresolved threads found`,
  )
}
