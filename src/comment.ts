import { OctokitClient } from '@/src/octokitClient'

export const deleteComment = async (
  octokit: OctokitClient,
  repoOwner: string,
  repoName: string,
  commentId: number,
): Promise<void> => {
  await octokit.issues.deleteComment({ owner: repoOwner, repo: repoName, comment_id: commentId })
}
