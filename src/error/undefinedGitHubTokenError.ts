import { BaseError } from '@/src/error/baseError'

export class UndefinedGitHubTokenError extends BaseError {
  constructor(cause?: Error) {
    super(
      'UNDEFINED_GITHUB_TOKEN',
      "Please add 'GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}' in the env section of your action.",
      cause,
    )
  }
}
