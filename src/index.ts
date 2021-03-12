import * as core from '@actions/core'
import { getOctokit } from '@actions/github'

import { BaseError } from '@/src/error/baseError'
import { UndefinedGitHubTokenError } from '@/src/error/UndefinedGitHubTokenError'
import { handleEvent } from '@/src/handler'
import { ConsoleLoggingService, LoggingService } from '@/src/loggingService'
import { OctokitInstance } from '@/src/octokitInstance'

const getOctokitClient = (): OctokitInstance => {
  const token = process.env.GITHUB_TOKEN
  if (token == null) {
    throw new UndefinedGitHubTokenError()
  }
  return getOctokit(token)
}

const handleError = async (loggingService: LoggingService, error: Error) => {
  if (error instanceof BaseError) {
    await loggingService.error(error)
    core.setFailed(error.description)
  } else {
    core.error(JSON.stringify(error, null, 2))
    core.setFailed('Unexpected Error')
  }
}

const main = async () => {
  const loggingService = new ConsoleLoggingService()
  const octokit = getOctokitClient()
  try {
    await handleEvent(loggingService, octokit)
  } catch (error) {
    await handleError(loggingService, error)
  }
}

main()
