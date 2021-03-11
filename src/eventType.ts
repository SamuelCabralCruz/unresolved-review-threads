export enum EventType {
  PULL_REQUEST_OPENED = 'pull_request_opened',
  PULL_REQUEST_REOPENED = 'pull_request_reopened',
  PULL_REQUEST_LABELED = 'pull_request_labeled',
  PULL_REQUEST_UNLABELED = 'pull_request_unlabeled',
  ISSUE_COMMENT_CREATED = 'issue_comment_created',
  PULL_REQUEST_REVIEW_COMMENT_CREATED = 'pull_request_review_comment_created',
  PULL_REQUEST_REVIEW_COMMENT_EDITED = 'pull_request_review_comment_edited',
  PULL_REQUEST_REVIEW_COMMENT_DELETED = 'pull_request_review_comment_deleted',
}

export const eventTypeFrom = (eventName: string, eventAction: string): EventType | undefined => {
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
        default:
          return undefined
      }
    case 'issue_comment':
      switch (eventAction) {
        case 'created':
          return EventType.ISSUE_COMMENT_CREATED
        default:
          return undefined
      }
    case 'pull_request_review_comment':
      switch (eventAction) {
        case 'created':
          return EventType.PULL_REQUEST_REVIEW_COMMENT_CREATED
        case 'edited':
          return EventType.PULL_REQUEST_REVIEW_COMMENT_EDITED
        case 'deleted':
          return EventType.PULL_REQUEST_REVIEW_COMMENT_DELETED
        default:
          return undefined
      }
    default:
      return undefined
  }
}
