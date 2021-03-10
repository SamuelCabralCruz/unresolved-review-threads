export class EventCategory {
    private static allValues = new Map<string, EventCategory>()

    public static PUSH = new EventCategory('push', '')
    public static PULL_REQUEST_OPENED = new EventCategory('pull_request', 'opened')
    public static PULL_REQUEST_REOPENED = new EventCategory('pull_request', 'reopened')
    public static PULL_REQUEST_LABELED = new EventCategory('pull_request', 'labeled')
    public static PULL_REQUEST_UNLABELED = new EventCategory('pull_request', 'unlabeled')
    public static ISSUE_COMMENT_CREATED = new EventCategory('issue_comment', 'created')
    public static PULL_REQUEST_REVIEW_COMMENT_CREATED = new EventCategory('pull_request_review_comment', 'created')
    public static PULL_REQUEST_REVIEW_COMMENT_EDITED = new EventCategory('pull_request_review_comment', 'edited')
    public static PULL_REQUEST_REVIEW_COMMENT_DELETED = new EventCategory('pull_request_review_comment', 'deleted')

    eventName: string
    eventType: string
    key: string

    private constructor(eventName: string, eventType: string, key?: string) {
        this.eventName = eventName
        this.eventType = eventType
        this.key = eventType ? [eventName, eventType].join('_') : eventName
        EventCategory.allValues.set(this.key, this)
    }

    static from(eventName: string, eventType: string): EventCategory | undefined {
        const searchedKey = [eventName, eventType].join('_')
        console.log(searchedKey)
        return EventCategory.allValues.get(searchedKey)
    }
}