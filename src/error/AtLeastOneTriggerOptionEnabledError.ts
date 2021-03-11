import {BaseError} from "@/src/error/baseError";

export class AtLeastOneTriggerOptionEnabledError extends BaseError {
    constructor(cause?: Error) {
        super("AT_LEAST_ONE_TRIGGER_OPTION_ENABLED", "There should be at least one trigger option enabled (label or comment).", cause);
    }
}