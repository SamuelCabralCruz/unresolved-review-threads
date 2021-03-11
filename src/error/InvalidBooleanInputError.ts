import { BaseError } from '@/src/error/baseError'

export class InvalidBooleanInputError extends BaseError {
  constructor(inputName: string, inputValue: string, cause?: Error) {
    super(
      `INVALID_BOOLEAN_INPUT`,
      `${inputName} should be 'true' or 'false', received: ${inputValue}`,
      cause,
    )
  }
}
