import * as faker from 'faker'

import { scanPullRequestForUnresolvedReviewThreads } from '@/src/unresolvedThread'
import { generateRepo } from '@/test/fixture/repo.fixture'
import { PartialLoggingServiceMock } from '@/test/typing/loggingService.helper'
import { PartialOctokitClientMock } from '@/test/typing/octokit.helper'

describe('unresolvedThread', () => {
  describe('scanPullRequestForUnresolvedReviewThreads', () => {
    const act = scanPullRequestForUnresolvedReviewThreads
    const loggingService: PartialLoggingServiceMock<'debug'> = {
      debug: jest.fn(),
    }
    let octokit: PartialOctokitClientMock<'graphql'>
    const reviewThreadsResponse = {
      repository: {
        pullRequest: {
          reviewThreads: {
            edges: [
              {
                node: {
                  isResolved: false,
                },
              },
              {
                node: {
                  isResolved: true,
                },
              },
              {
                node: {
                  isResolved: true,
                },
              },
              {
                node: {
                  isResolved: false,
                },
              },
              {
                node: {
                  isResolved: false,
                },
              },
              {
                node: {
                  isResolved: true,
                },
              },
              {
                node: {
                  isResolved: false,
                },
              },
            ],
          },
        },
      },
    }
    const { repoOwner, repoName } = generateRepo()
    const pullRequest = faker.random.number()

    beforeEach(() => {
      octokit = {
        graphql: jest.fn().mockReturnValue(reviewThreadsResponse),
      }
    })

    test('should fetch all review threads using octokit', async () => {
      await act(loggingService as any, octokit as any, repoOwner, repoName, pullRequest)

      expect(octokit.graphql).toHaveBeenCalledWith(expect.any(String), {
        repoOwner,
        repoName,
        pullRequest,
      })
    })

    test('should log retrieved review threads', async () => {
      await act(loggingService as any, octokit as any, repoOwner, repoName, pullRequest)

      expect(loggingService.debug).toHaveBeenCalledWith(
        'Review Threads Response',
        JSON.stringify(reviewThreadsResponse, null, 2),
      )
    })

    test('should return summary of unresolved review threads', async () => {
      const observed = await act(
        loggingService as any,
        octokit as any,
        repoOwner,
        repoName,
        pullRequest,
      )

      expect(observed).toEqual({
        anyUnresolved: true,
        numberOfUnresolved: 4,
      })
    })
  })
})
