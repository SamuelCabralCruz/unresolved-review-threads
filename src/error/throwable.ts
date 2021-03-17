export abstract class Throwable extends Error {
  public readonly stack: string

  protected constructor(message: string, cause?: Error) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.stack = cause ? combineStackTraces(this, cause) : ''
  }
}

const lineSeparator = '\n'
const combineStackTraces = (newError: Throwable, cause: Error) =>
  [newError.stack.split(lineSeparator).slice(0, 2).join(lineSeparator), cause.stack].join(
    lineSeparator,
  )
