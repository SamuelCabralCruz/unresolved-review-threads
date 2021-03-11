import { OctokitInstance } from '@/src/octokitInstance'

export const deleteComment = async (
  octokit: OctokitInstance,
  repoOwner: string,
  repoName: string,
  commentId: number,
): Promise<void> => {
  octokit.issues.deleteComment({ owner: repoOwner, repo: repoName, comment_id: commentId })
}
