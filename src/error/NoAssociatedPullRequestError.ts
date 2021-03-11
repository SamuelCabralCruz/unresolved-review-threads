import {BaseError} from "@/src/error/baseError";

export class NoAssociatedPullRequestError extends BaseError {
    constructor(cause?: Error) {
        super("NO_ASSOCIATED_PULL_REQUEST", "There is no pull request associated to the event payload.", cause);
    }
}