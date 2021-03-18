import { OctokitClient } from '@/src/octokitClient'
import { PullRequest } from '@/src/pullRequest'

export const hasLabel = (pullRequest: PullRequest, labelName: string): boolean =>
  pullRequest.labels.map((x) => x.name).includes(labelName)

export const addLabel = async (
  octokit: OctokitClient,
  repoOwner: string,
  repoName: string,
  pullRequest: PullRequest,
  labelName: string,
): Promise<void> => {
  if (!hasLabel(pullRequest, labelName)) {
    await octokit.issues.addLabels({
      owner: repoOwner,
      repo: repoName,
      issue_number: pullRequest.number,
      labels: [labelName],
    })
  }
}

export const removeLabel = async (
  octokit: OctokitClient,
  repoOwner: string,
  repoName: string,
  pullRequest: PullRequest,
  labelName: string,
): Promise<void> => {
  if (hasLabel(pullRequest, labelName)) {
    await octokit.issues.removeLabel({
      owner: repoOwner,
      repo: repoName,
      issue_number: pullRequest.number,
      name: labelName,
    })
  }
}
