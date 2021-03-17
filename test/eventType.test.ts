import * as faker from 'faker'

import { InvalidEventTypeError } from '@/src/error/invalidEventTypeError'
import { EventType, eventTypeFrom } from '@/src/eventType'

describe('EventType', () => {
  describe('eventTypeFrom', () => {
    const act = eventTypeFrom

    test('should throw on unknown combination of event name and action', () => {
      const actCall = () => act(faker.lorem.word(), faker.lorem.word())

      expect(actCall).toThrowError(InvalidEventTypeError)
    })

    test.each([
      ['pull_request', 'opened', EventType.PULL_REQUEST_OPENED],
      ['pull_request', 'reopened', EventType.PULL_REQUEST_REOPENED],
      ['pull_request', 'labeled', EventType.PULL_REQUEST_LABELED],
      ['pull_request', 'unlabeled', EventType.PULL_REQUEST_UNLABELED],
      ['issue_comment', 'created', EventType.ISSUE_COMMENT_CREATED],
      ['pull_request_review_comment', 'created', EventType.PULL_REQUEST_REVIEW_COMMENT_CREATED],
      ['pull_request_review_comment', 'edited', EventType.PULL_REQUEST_REVIEW_COMMENT_EDITED],
      ['pull_request_review_comment', 'deleted', EventType.PULL_REQUEST_REVIEW_COMMENT_DELETED],
    ])(
      'should parse properly with %s %s',
      (eventName: string, eventAction: string, expectedEventType: EventType) => {
        const observed = act(eventName, eventAction)

        expect(observed).toBe(expectedEventType)
      },
    )
  })
})
