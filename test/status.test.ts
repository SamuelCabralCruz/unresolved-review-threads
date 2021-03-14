import * as faker from 'faker'

import { PullRequestContext } from '@/src/context'
import { setCheckStatusAsFailure, setCheckStatusAsSuccess } from '@/src/status'
import { generatePullRequest } from '@/test/fixture/pullRequest.fixture'
import { generateRepo } from '@/test/fixture/repo.fixture'
import { PartialOctokitClientMock } from '@/test/typing/octokit.helper'

describe('status', () => {
  const octokit: PartialOctokitClientMock<'repos', 'createCommitStatus'> = {
    repos: {
      createCommitStatus: jest.fn(),
    },
  }
  const { repoOwner, repoName } = generateRepo()
  const pullRequest = generatePullRequest()
  const runId = faker.random.number()
  const context: Partial<PullRequestContext> = { repoOwner, repoName, pullRequest, runId }

  describe('setCheckStatusAsSuccess', () => {
    const act = setCheckStatusAsSuccess

    test('should set check status as success using octokit', async () => {
      await act(octokit as any, context as any)

      expect(octokit.repos.createCommitStatus).toHaveBeenCalledWith({
        owner: repoOwner,
        repo: repoName,
        sha: pullRequest.headRef,
        state: 'success',
        context: 'Unresolved Review Threads',
        description: 'no unresolved thread found',
        target_url: `https://github.com/${repoOwner}/${repoName}/actions/runs/${runId}`,
      })
    })
  })

  describe('setCheckStatusAsFailure', () => {
    const act = setCheckStatusAsFailure

    test('should set check status as failure using octokit', async () => {
      await act(octokit as any, context as any, 4)

      expect(octokit.repos.createCommitStatus).toHaveBeenCalledWith({
        owner: repoOwner,
        repo: repoName,
        sha: pullRequest.headRef,
        state: 'failure',
        context: 'Unresolved Review Threads',
        description: '4 unresolved threads found',
        target_url: `https://github.com/${repoOwner}/${repoName}/actions/runs/${runId}`,
      })
    })
  })
})
