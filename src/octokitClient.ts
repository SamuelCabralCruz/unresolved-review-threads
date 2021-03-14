import { getOctokit } from '@actions/github'
import { Endpoints, RequestParameters } from '@octokit/types'

import { UndefinedGitHubTokenError } from '@/src/error/undefinedGitHubTokenError'

type OctokitClientEndpoint = {
  parameters: unknown
  response: unknown
}
type OctokitClientMethod<T extends OctokitClientEndpoint> = (
  params: T['parameters'],
) => Promise<T['response']>
export type OctokitClient = {
  graphql: <T>(query: string, parameters?: RequestParameters) => Promise<T>
  issues: {
    addLabels: OctokitClientMethod<
      Endpoints['POST /repos/{owner}/{repo}/issues/{issue_number}/labels']
    >
    removeLabel: OctokitClientMethod<
      Endpoints['DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}']
    >
    deleteComment: OctokitClientMethod<
      Endpoints['DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}']
    >
  }
  pulls: {
    get: OctokitClientMethod<Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']>
  }
  repos: {
    createCommitStatus: OctokitClientMethod<Endpoints['POST /repos/{owner}/{repo}/statuses/{sha}']>
  }
}

export const getOctokitClient = (): OctokitClient => {
  const token = process.env.GITHUB_TOKEN
  if (token == null) {
    throw new UndefinedGitHubTokenError()
  }
  return getOctokit(token)
}
