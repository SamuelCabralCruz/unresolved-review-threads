import {OctokitInstance} from "@/src/octokitInstance";

export const findComment = async (octokit: OctokitInstance, repoOwner: string, repoName: string, pullRequest: number, content: string): Promise<number | undefined> => {
    const comments = await octokit.issues.listComments({owner: repoOwner, repo: repoName, issue_number: pullRequest})
    // console.log(JSON.stringify(comments))
    // TODO: use regex instead with distinctive content
    return comments.data.find(x => x.body_text === content)?.id
}

export const createComment = async (octokit: OctokitInstance, repoOwner: string, repoName: string, pullRequest: number, content: string): Promise<void> => {
    octokit.issues.createComment({owner: repoOwner, repo: repoName, issue_number: pullRequest, body: content})
}

export const deleteComment = async (octokit: OctokitInstance, repoOwner: string, repoName: string, commentId: number): Promise<void> => {
    octokit.issues.deleteComment({owner: repoOwner, repo: repoName, comment_id: commentId})
}
