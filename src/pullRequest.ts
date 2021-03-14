import { OctokitClient } from '@/src/octokitClient'

export type Label = Readonly<{ name?: string }>
export type PullRequest = Readonly<{
  number: number
  headRef: string
  labels: Label[]
}>

export const getPullRequest = async (
  octokit: OctokitClient,
  repoOwner: string,
  repoName: string,
  pullRequestNumber: number,
): Promise<PullRequest> => {
  const pullRequest = await octokit.pulls.get({
    owner: repoOwner,
    repo: repoName,
    pull_number: pullRequestNumber,
  })
  return {
    number: pullRequestNumber,
    headRef: pullRequest.data.head.sha,
    labels: pullRequest.data.labels,
  }
}
