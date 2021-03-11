import { BaseError } from '@/src/error/baseError'

export class DefinedResolvedCommentWithDisabledTriggerError extends BaseError {
  constructor(cause?: Error) {
    super(
      `DEFINED_RESOLVED_COMMENT_WITH_DISABLED_TRIGGER`,
      `Can't define a resolved comment trigger if use of comment trigger is disabled.`,
      cause,
    )
  }
}
