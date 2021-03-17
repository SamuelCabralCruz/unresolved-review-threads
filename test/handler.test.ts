import * as core from '@actions/core'

import { handleError } from '@/src/handler'
import { CustomError } from '@/test/error/helper/customError.helper'
import { PartialLoggingServiceMock } from '@/test/typing/loggingService.helper'
import SpyInstance = jest.SpyInstance

describe('handler', () => {
  describe('handleError', () => {
    const act = handleError
    const loggingService: PartialLoggingServiceMock<'error'> = {
      error: jest.fn(),
    }
    let coreErrorSpy: SpyInstance
    let coreSetFailedSpy: SpyInstance

    beforeEach(() => {
      coreErrorSpy = jest.spyOn(core, 'error').mockImplementation()
      coreSetFailedSpy = jest.spyOn(core, 'setFailed').mockImplementation()
    })

    describe('with instance of base error', () => {
      const error = new CustomError('some error name', 'some error description')

      test('should log error using logging service', async () => {
        await act(loggingService as any, error)

        expect(loggingService.error).toHaveBeenCalledWith(error)
      })

      test('should set workflow as failed', async () => {
        await act(loggingService as any, error)

        expect(coreSetFailedSpy).toHaveBeenCalledWith(error.description)
      })
    })

    describe('with unrecognized error', () => {
      const error = new Error('some unrecognized error')

      test('should log error using workflow core utility', async () => {
        await act(loggingService as any, error)

        expect(coreErrorSpy).toHaveBeenCalledWith(JSON.stringify(error.stack, null, 2))
      })

      test('should set workflow as failed', async () => {
        await act(loggingService as any, error)

        expect(coreSetFailedSpy).toHaveBeenCalledWith('Unexpected Error')
      })
    })
  })
})
