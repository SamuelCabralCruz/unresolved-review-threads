import * as core from '@actions/core'
import * as github from '@actions/github'
import { RestEndpointMethodTypes } from '@octokit/rest';
import {setFailed} from "@actions/core";

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

const PULL_REQUEST_REVIEW_COMMENT_EVENT_NAME = 'pull_request_review_comment'

async function main() {
    try {
        const token = process.env.GITHUB_TOKEN
        if(token == null) {
            console.log("Failure - No token provided")
            setFailed('Undefined GITHUB_TOKEN')
            return
        }

        console.log(`Event: ${github.context.eventName}`)
        // console.log(JSON.stringify(github.context.payload))

        const pullRequest = github.context.payload.pull_request as PullRequest;
        if (pullRequest == null) {
            console.log('Failure - Pull request undefined')
            setFailed('Something went wrong!')
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

        const workflow = await octokit.actions.getWorkflowRun({owner: variables.repoOwner,repo: variables.repoName,run_id: github.context.runId })
        // console.log(workflow.data.check_suite_url)
        const currentCheckSuiteId = +workflow.data.check_suite_url.substring(workflow.data.check_suite_url.lastIndexOf('/')+1)
        console.log(`Current Check Suite Id: ${currentCheckSuiteId}`)

        let checkRunId = undefined
        if(github.context.eventName === PULL_REQUEST_REVIEW_COMMENT_EVENT_NAME) {
            const checks = await octokit.checks.listForRef({
                owner: variables.repoOwner,
                repo: variables.repoName,
                ref: variables.sha,
                check_name: 'unresolvedReviewThreads',
                filter: 'latest',
            })
            checks.data.check_runs.forEach(x => {
                console.log(JSON.stringify({
                    id: x.id,
                    checkSuiteId: x.check_suite.id,
                    name: x.name,
                    status: x.status,
                    startedAt: x.started_at,
                    completedAt: x.completed_at,
                    conclusion: x.conclusion,
                    output: x.output
                }))
            })
            const check = checks.data.check_runs
                .sort((a, b) => new Date(b.started_at).valueOf() - new Date(a.started_at).valueOf())
                .find(x => x.check_suite.id !== currentCheckSuiteId)
            if(check == null) {
                console.log("Failure - Can't find associated check run id")
                setFailed('Something went wrong!')
                return
            }
            checkRunId = check.id
            console.log(`Associated Check Run ID: ${checkRunId}`)
            octokit.checks.update({
                owner: variables.repoOwner,
                repo: variables.repoName,
                check_run_id: checkRunId,
                status: "in_progress"
            })
        }

        const triggerLabelName = core.getInput('label') || 'reviewThreadsResolved';
        if(!!pullRequest.labels.filter(x => x.name === triggerLabelName).length) {
            octokit.issues.removeLabel({owner: variables.repoOwner, repo: variables.repoName,issue_number: variables.pullRequest, name: triggerLabelName})
        }

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

        if(github.context.eventName === PULL_REQUEST_REVIEW_COMMENT_EVENT_NAME) {
            await octokit.checks.update({
                owner: variables.repoOwner,
                repo: variables.repoName,
                check_run_id: checkRunId,
                status: "completed",
                conclusion: anyUnresolvedReviewThreads ? 'failure' : 'success',
                output: {
                    title: PULL_REQUEST_REVIEW_COMMENT_EVENT_NAME,
                    summary: '',
                }
            })
        }

        if (anyUnresolvedReviewThreads) {
            console.log("Failure - It seems there are some unresolved review threads!")
            setFailed("Presence of unresolved review threads")
        } else {
            console.log("Success - No unresolved review threads")
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

main()
