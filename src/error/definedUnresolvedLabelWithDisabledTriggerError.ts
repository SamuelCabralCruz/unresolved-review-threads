import { BaseError } from '@/src/error/baseError'

export class DefinedUnresolvedLabelWithDisabledTriggerError extends BaseError {
  constructor(cause?: Error) {
    super(
      'DEFINED_UNRESOLVED_LABEL_WITH_DISABLED_TRIGGER',
      "Can't define a unresolved label if use of label trigger is disabled.",
      cause,
    )
  }
}
