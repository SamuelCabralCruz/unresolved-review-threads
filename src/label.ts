import {PullRequest} from "@/src/PullRequest";
import {OctokitInstance} from "@/src/octokitInstance";

export const hasLabel = (pullRequest: PullRequest, labelName: string): boolean => {
    return !!pullRequest.labels.filter(x => x.name === labelName).length
}

export const addLabel = async (octokit: OctokitInstance, repoOwner: string, repoName: string, pullRequest: PullRequest, labelName: string): Promise<void> => {
    if(!hasLabel(pullRequest, labelName)) {
        await octokit.issues.addLabels({owner: repoOwner, repo: repoName, issue_number: pullRequest.number, labels: [labelName]})
    }
}

export const removeLabel = async (octokit: OctokitInstance, repoOwner: string, repoName: string, pullRequest: PullRequest, labelName: string): Promise<void> => {
    if(hasLabel(pullRequest, labelName)) {
        await octokit.issues.removeLabel({owner: repoOwner, repo: repoName,issue_number: pullRequest.number, name: labelName})
    }
}
