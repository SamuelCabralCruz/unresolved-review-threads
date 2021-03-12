import { BaseError } from '@/src/error/baseError'

export class DefinedDeleteResolvedCommentWithDisabledTriggerError extends BaseError {
  constructor(cause?: Error) {
    super(
      'DEFINED_DELETE_RESOLVED_COMMENT_WITH_DISABLED_TRIGGER',
      "Can't activate deletion of resolved comment trigger if use of comment trigger is disabled.",
      cause,
    )
  }
}
