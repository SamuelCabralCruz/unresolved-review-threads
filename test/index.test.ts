import { mocked } from 'ts-jest/utils'

import { handleError, handleEvent } from '@/src/handler'
import { main } from '@/src/index'
import { ConsoleLoggingService } from '@/src/loggingService'
import { getOctokitClient } from '@/src/octokitClient'

jest.mock('@/src/handler')
const handleEventMock = mocked(handleEvent, true)
const handleErrorMock = mocked(handleError, true)
jest.mock('@/src/octokitClient')
const getOctokitClientMock = mocked(getOctokitClient, true)
jest.mock('@/src/loggingService')
const consoleLoggingServiceMock = mocked(ConsoleLoggingService, true)

describe('index', () => {
  describe('main', () => {
    const act = main

    test('should handle event', async () => {
      const octokitClientMock = jest.fn()
      getOctokitClientMock.mockReturnValue(octokitClientMock as any)

      await act()

      expect(handleEventMock).toHaveBeenCalledWith(
        consoleLoggingServiceMock.mock.instances[0],
        octokitClientMock,
      )
    })

    test('with error throwing event handling should handle error', async () => {
      const error = new Error('something went wrong')
      handleEventMock.mockImplementation(() => {
        throw error
      })

      await act()

      expect(handleErrorMock).toHaveBeenCalledWith(
        consoleLoggingServiceMock.mock.instances[0],
        error,
      )
    })
  })
})
