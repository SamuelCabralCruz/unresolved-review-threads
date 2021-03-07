import * as core from '@actions/core'
import * as github from '@actions/github'

async function main() {
    try {
        console.log(JSON.stringify(github.context))
        // if (github.context.eventName === 'pull_request_review_comment')
        const token = process.env.GITHUB_TOKEN! // TODO: add check
        const octokit = github.getOctokit(token)
        const query = `
        query reviewThreads($owner:String!,$repo:String!,$pull_request:Int!) {
            repository(owner: $owner, name: $repo) {
                pullRequest(number: $pull_request) {
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
        const variables = {
            repoOwner: github.context.repo.owner,
            repoName: github.context.repo.repo,
            pullRequest: github.context.payload.pull_request?.number
        }
        const reviewThreads = await octokit.graphql(query, variables)
        // TODO
        console.log(JSON.stringify(reviewThreads))
        octokit.checks.create({
            owner: variables.repoOwner,
            repo: variables.repoName,
            name: "Unresolved Review Threads",
            head_sha: github.context.sha,
            status: "completed",
            conclusion: "failure",
            output: {
                title: "Unresolved Review Threads",
                summary: "It seems there are some unresolved review threads!"
            }
        })
    } catch (error) {
        core.setFailed(error.message);
    }
}

main()
