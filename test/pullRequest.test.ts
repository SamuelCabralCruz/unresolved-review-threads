import * as faker from 'faker'

import { getPullRequest } from '@/src/pullRequest'
import { generateRepo } from '@/test/fixture/repo.fixture'
import { PartialOctokitClientMock } from '@/test/typing/octokit.helper'

describe('pullRequest', () => {
  describe('getPullRequest', () => {
    const act = getPullRequest
    let octokit: PartialOctokitClientMock<'pulls', 'get'>
    const pullRequestResponse = {
      data: {
        head: {
          sha: faker.git.commitSha(),
        },
        labels: [
          {
            name: faker.lorem.word(),
          },
          {
            name: faker.lorem.word(),
          },
          {
            name: faker.lorem.word(),
          },
        ],
      },
    }
    const { repoOwner, repoName } = generateRepo()
    const pullRequestNumber = faker.random.number()

    beforeEach(() => {
      octokit = {
        pulls: {
          get: jest.fn().mockReturnValue(pullRequestResponse),
        },
      }
    })

    test('should', async () => {
      await act(octokit as any, repoOwner, repoName, pullRequestNumber)

      expect(octokit.pulls.get).toHaveBeenCalledWith({
        owner: repoOwner,
        repo: repoName,
        pull_number: pullRequestNumber,
      })
    })
  })
})
