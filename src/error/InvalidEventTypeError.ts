import { BaseError } from '@/src/error/baseError'

export class InvalidEventTypeError extends BaseError {
  constructor(eventName: string, eventAction: string, cause?: Error) {
    super(
      'INVALID_EVENT_TYPE',
      `Unknown combination of event name (${eventName}) and action (${eventAction}).`,
      cause,
    )
  }
}
