import { BaseError } from '@/src/error/baseError'

export class CustomError extends BaseError {
  constructor(error: string, description: string, cause?: Error) {
    super(error, description, cause)
  }
}
