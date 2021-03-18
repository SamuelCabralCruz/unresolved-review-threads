import * as faker from 'faker'

import { InvalidEventTypeError } from '@/src/error/invalidEventTypeError'
import { EventType, eventTypeFrom } from '@/src/eventType'

describe('EventType', () => {
  describe('eventTypeFrom', () => {
    const act = eventTypeFrom

    test.each([
      [faker.lorem.word(), faker.lorem.word()],
      ['pull_request', faker.lorem.word()],
      ['pull_request_review_comment', faker.lorem.word()],
    ])(
      'should throw on unknown combination of event name and action',
      (eventName: string, eventAction: string) => {
        const actCall = () => act(eventName, eventAction)

        expect(actCall).toThrowError(InvalidEventTypeError)
      },
    )

    test.each([
      ['pull_request', 'opened', EventType.PULL_REQUEST_OPENED],
      ['pull_request', 'reopened', EventType.PULL_REQUEST_REOPENED],
      ['pull_request', 'labeled', EventType.PULL_REQUEST_LABELED],
      ['pull_request', 'unlabeled', EventType.PULL_REQUEST_UNLABELED],
      ['pull_request', 'synchronize', EventType.PULL_REQUEST_SYNCHRONIZE],
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
