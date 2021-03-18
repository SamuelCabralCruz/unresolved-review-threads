import { InvalidEventTypeError } from '@/src/error/invalidEventTypeError'

export enum EventType {
  PULL_REQUEST_OPENED = 'pull_request_opened',
  PULL_REQUEST_REOPENED = 'pull_request_reopened',
  PULL_REQUEST_LABELED = 'pull_request_labeled',
  PULL_REQUEST_UNLABELED = 'pull_request_unlabeled',
  PULL_REQUEST_SYNCHRONIZE = 'pull_request_synchronize',
  PULL_REQUEST_REVIEW_REQUESTED = 'pull_request_review_requested',
  PULL_REQUEST_REVIEW_REQUEST_REMOVED = 'pull_request_review_request_removed',
  PULL_REQUEST_REVIEW_SUBMITTED = 'pull_request_review_submitted',
  PULL_REQUEST_REVIEW_EDITED = 'pull_request_review_edited',
  PULL_REQUEST_REVIEW_DISMISSED = 'pull_request_review_dismissed',
  PULL_REQUEST_REVIEW_COMMENT_EDITED = 'pull_request_review_comment_edited',
  PULL_REQUEST_REVIEW_COMMENT_DELETED = 'pull_request_review_comment_deleted',
}

export const eventTypeFrom = (eventName: string, eventAction: string): EventType => {
  switch (eventName) {
    case 'pull_request':
      switch (eventAction) {
        case 'opened':
          return EventType.PULL_REQUEST_OPENED
        case 'reopened':
          return EventType.PULL_REQUEST_REOPENED
        case 'labeled':
          return EventType.PULL_REQUEST_LABELED
        case 'unlabeled':
          return EventType.PULL_REQUEST_UNLABELED
        case 'synchronize':
          return EventType.PULL_REQUEST_SYNCHRONIZE
        case 'review_requested':
          return EventType.PULL_REQUEST_REVIEW_REQUESTED
        case 'review_request_removed':
          return EventType.PULL_REQUEST_REVIEW_REQUEST_REMOVED
        default:
          throw new InvalidEventTypeError(eventName, eventAction)
      }
    case 'pull_request_review':
      switch (eventAction) {
        case 'submitted':
          return EventType.PULL_REQUEST_REVIEW_SUBMITTED
        case 'edited':
          return EventType.PULL_REQUEST_REVIEW_EDITED
        case 'dismissed':
          return EventType.PULL_REQUEST_REVIEW_DISMISSED
        default:
          throw new InvalidEventTypeError(eventName, eventAction)
      }
    case 'pull_request_review_comment':
      switch (eventAction) {
        case 'edited':
          return EventType.PULL_REQUEST_REVIEW_COMMENT_EDITED
        case 'deleted':
          return EventType.PULL_REQUEST_REVIEW_COMMENT_DELETED
        default:
          throw new InvalidEventTypeError(eventName, eventAction)
      }
    default:
      throw new InvalidEventTypeError(eventName, eventAction)
  }
}
