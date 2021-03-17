import { LoggingService } from '@/src/loggingService'
import { OctokitClient } from '@/src/octokitClient'

const QUERY = `
        query reviewThreads($repoOwner:String!,$repoName:String!,$pullRequest:Int!) {
            repository(owner: $repoOwner, name: $repoName) {
                pullRequest(number: $pullRequest) {
                    reviewThreads(first: 100) {
                        edges {
                            node {
                                isResolved
                            }
                        }
                    }
                }
            }
        }`

type ReviewThreadsResponse = {
  repository: {
    pullRequest: {
      reviewThreads: {
        edges: [
          {
            node: {
              isResolved: boolean
            }
          },
        ]
      }
    }
  }
}

export type UnresolvedThreads = {
  anyUnresolved: boolean
  numberOfUnresolved: number
}

export const scanPullRequestForUnresolvedReviewThreads = async (
  loggingService: LoggingService,
  octokit: OctokitClient,
  repoOwner: string,
  repoName: string,
  pullRequest: number,
): Promise<UnresolvedThreads> => {
  const variables = {
    repoOwner,
    repoName,
    pullRequest,
  }
  const reviewThreads: ReviewThreadsResponse = await octokit.graphql(QUERY, variables)
  await loggingService.debug('Review Threads Response', JSON.stringify(reviewThreads, null, 2))
  const unresolvedReviewThreads = reviewThreads.repository.pullRequest.reviewThreads.edges.filter(
    (x) => !x.node.isResolved,
  )
  return {
    anyUnresolved: !!unresolvedReviewThreads.length,
    numberOfUnresolved: unresolvedReviewThreads.length,
  }
}
