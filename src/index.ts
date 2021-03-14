import { handleError, handleEvent } from '@/src/handler'
import { ConsoleLoggingService } from '@/src/loggingService'
import { getOctokitClient } from '@/src/octokitClient'

export const main = async (): Promise<void> => {
  const loggingService = new ConsoleLoggingService()
  const octokit = getOctokitClient()
  try {
    await handleEvent(loggingService, octokit)
  } catch (error) {
    await handleError(loggingService, error)
  }
}

main()
