import * as faker from 'faker'

import { CustomError } from '@/test/error/helper/customError.helper'
import { extractSafely, throwOriginal } from '@/test/error/helper/throwable.helper'

describe('BaseError', () => {
  test('should capture stack trace properly', () => {
    const error1 = extractSafely(throwOriginal)
    const error2 = extractSafely(() => {
      throw new CustomError(
        faker.commerce.productName(),
        faker.commerce.productDescription(),
        error1,
      )
    })
    const someErrorType = faker.lorem.word()
    const someErrorDescription = faker.lorem.sentence()

    const observed = new CustomError(someErrorType, someErrorDescription, error2)

    expect(observed.name).toEqual('CustomError')
    expect(observed.stack).toContain(error1.stack)
    expect(observed.stack).toContain(error2.stack)
    expect(observed.stack.split('\n')[0]).toContain('CustomError: ')
    expect(observed.error).toEqual(someErrorType)
    expect(observed.description).toEqual(someErrorDescription)
    expect(observed.message).toEqual(`${someErrorType} - ${someErrorDescription}`)
  })
})
