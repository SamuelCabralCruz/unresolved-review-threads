import { ConsoleLoggingService } from '@/src/loggingService'
import { CustomError } from '@/test/error/helper/customError.helper'

describe('Console Logging Service', () => {
  const cut = new ConsoleLoggingService()
  let spyConsole: jest.SpyInstance

  beforeEach(() => {
    process.env = {}
    spyConsole = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('info', () => {
    const act = cut.info

    test('should log info properly', async () => {
      const content = 'some info to be logged'

      await act(content)

      expect(spyConsole).toHaveBeenCalledWith('')
      expect(spyConsole).toHaveBeenCalledWith('INFO - some info to be logged')
    })

    test('should log multilines info properly', async () => {
      const content = 'some info to be logged\nanother line\nAnd another one'

      await act(content)

      expect(spyConsole).toHaveBeenCalledWith('')
      expect(spyConsole).toHaveBeenCalledWith('INFO - some info to be logged')
      expect(spyConsole).toHaveBeenCalledWith('INFO - another line')
      expect(spyConsole).toHaveBeenCalledWith('INFO - And another one')
    })
  })

  describe('debug', () => {
    const act = cut.debug

    beforeEach(() => {
      process.env = { LOGGING_LEVEL: 'DEBUG' }
    })

    test('should not log is logging level is not set to DEBUG', async () => {
      process.env = { LOGGING_LEVEL: '' }

      await act('some info to be logged')

      expect(spyConsole).not.toHaveBeenCalled()
    })

    test('should log info properly', async () => {
      const content = 'some info to be logged'

      await act(content)

      expect(spyConsole).toHaveBeenCalledWith('')
      expect(spyConsole).toHaveBeenCalledWith('DEBUG - some info to be logged')
    })

    test('should log multilines info properly', async () => {
      const content = 'some info to be logged\nanother line\nAnd another one'

      await act(content)

      expect(spyConsole).toHaveBeenCalledWith('')
      expect(spyConsole).toHaveBeenCalledWith('DEBUG - some info to be logged')
      expect(spyConsole).toHaveBeenCalledWith('DEBUG - another line')
      expect(spyConsole).toHaveBeenCalledWith('DEBUG - And another one')
    })
  })

  describe('error', () => {
    const act = cut.error

    test('should log error properly', async () => {
      const error = new CustomError('CUSTOM_BASE_ERROR', 'some description of the error')

      await act(error)

      expect(spyConsole).toHaveBeenCalledWith('')
      expect(spyConsole).toHaveBeenCalledWith(
        'ERROR - CUSTOM_BASE_ERROR - some description of the error',
      )
    })

    test('should log error with cause properly', async () => {
      const cause = new Error('some cause error message')
      const error = new CustomError('CUSTOM_BASE_ERROR', 'some description of the error', cause)

      await act(error)

      expect(spyConsole).toHaveBeenCalledWith('')
      expect(spyConsole).toHaveBeenCalledWith(
        'ERROR - CUSTOM_BASE_ERROR - some description of the error',
      )
      error.stack
        .split('\n')
        .forEach((x) => expect(spyConsole).toHaveBeenCalledWith(`ERROR - ${x}`))
    })
  })
})
