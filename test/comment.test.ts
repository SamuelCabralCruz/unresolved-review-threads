import * as faker from 'faker'

import { deleteComment } from '@/src/comment'
import { generateRepo } from '@/test/fixture/repo.fixture'
import { PartialOctokitClientMock } from '@/test/typing/octokit.helper'

describe('comment', () => {
  describe('deleteComment', () => {
    const act = deleteComment
    const octokit: PartialOctokitClientMock<'issues', 'deleteComment'> = {
      issues: {
        deleteComment: jest.fn(),
      },
    }

    test('should delete comment using octokit', async () => {
      const { repoOwner, repoName } = generateRepo()
      const commentId = faker.random.number()

      await act(octokit as any, repoOwner, repoName, commentId)

      expect(octokit.issues.deleteComment).toHaveBeenCalledWith({
        owner: repoOwner,
        repo: repoName,
        comment_id: commentId,
      })
    })
  })
})
