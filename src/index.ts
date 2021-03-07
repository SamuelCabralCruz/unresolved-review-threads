import * as core from '@actions/core'
import * as github from '@actions/github'
import { RestEndpointMethodTypes } from '@octokit/rest';

type PullRequest = RestEndpointMethodTypes['pulls']['get']['response']['data']

type ReviewThreadsResponse = {
    repository: {
        pullRequest: {
            reviewThreads: {
                edges: [
                    {
                        node: {
                            isResolved: boolean
                        }
                    }
                ]
            }
        }
    }
}

async function main() {
    try {
        const token = process.env.GITHUB_TOKEN
        if(token == null) throw new Error('Undefined GITHUB_TOKEN')

        console.log(`Event: ${github.context.eventName}`)
        // console.log(JSON.stringify(github.context.payload))

        const pullRequest = github.context.payload.pull_request as PullRequest;
        if (pullRequest == null) {
            console.log('Not a pull request comment. Workflow skipped.')
            return
        }

        let sha = github.context.sha
        if (pullRequest.head.sha) {
            sha = pullRequest.head.sha;
        }

        const variables = {
            repoOwner: github.context.repo.owner,
            repoName: github.context.repo.repo,
            pullRequest: pullRequest.number,
            sha
        }

        console.log(`Repository Owner: ${variables.repoOwner}`)
        console.log(`Repository Name: ${variables.repoName}`)
        console.log(`Pull Request Number: ${variables.pullRequest}`)
        console.log(`Pull Request HEAD SHA: ${variables.sha}`)

        const octokit = github.getOctokit(token)

        const triggerLabelName = core.getInput('label') || 'reviewThreadsResolved';
        if(!!pullRequest.labels.filter(x => x.name === triggerLabelName).length) {
            octokit.issues.removeLabel({owner: variables.repoOwner, repo: variables.repoName,issue_number: variables.pullRequest, name: triggerLabelName})
        }

        const check = await octokit.checks.create({
            owner: variables.repoOwner,
            repo: variables.repoName,
            head_sha: variables.sha,
            name: "Unresolved Review Threads",
            status: "in_progress",
            started_at: new Date().toISOString(),
        })

        const query = `
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
        const reviewThreads: ReviewThreadsResponse = await octokit.graphql(query, variables)
        // console.log(JSON.stringify(reviewThreads))
        const unresolvedReviewThreads = reviewThreads.repository.pullRequest.reviewThreads.edges.filter(x => !x.node.isResolved)
        console.log(`Number of Unresolved Review Threads: ${unresolvedReviewThreads.length}`)
        const anyUnresolvedReviewThreads = !!unresolvedReviewThreads.length

        octokit.checks.update({
            owner: variables.repoOwner,
            repo: variables.repoName,
            check_run_id: check.data.id,
            status: "completed",
            conclusion: anyUnresolvedReviewThreads ? "failure" : "success",
            output: {
                title: "Unresolved Review Threads",
                summary: anyUnresolvedReviewThreads? "It seems there are some unresolved review threads!": "No unresolved review threads!"
            }
        })
    } catch (error) {
        core.setFailed(error.message);
    }
}

main()
