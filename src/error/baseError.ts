import { Throwable } from '@/src/error/throwable'

export abstract class BaseError extends Throwable {
  public readonly error: string
  public readonly description: string

  protected constructor(error: string, description: string, cause?: Error) {
    super(cause)
    this.error = error
    this.description = description
  }

  get message(): string {
    return `${this.error} - ${this.description}`
  }
}
