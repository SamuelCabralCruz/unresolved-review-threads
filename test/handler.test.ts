import { mocked } from 'ts-jest/utils'
import * as core from '@actions/core'

import { getContext, UnresolvedActionContext } from '@/src/context'
import { handleError, handleEvent } from '@/src/handler'
import { addLabel, removeLabel } from '@/src/label'
import { setCheckStatusAsFailure, setCheckStatusAsSuccess } from '@/src/status'
import {
  scanPullRequestForUnresolvedReviewThreads,
  UnresolvedThreads,
} from '@/src/unresolvedThread'
import { CustomError } from '@/test/error/helper/customError.helper'
import { generatePullRequest } from '@/test/fixture/pullRequest.fixture'
import { generateRepo } from '@/test/fixture/repo.fixture'
import { PartialLoggingServiceMock } from '@/test/typing/loggingService.helper'
import { PartialOctokitClientMock } from '@/test/typing/octokit.helper'
import SpyInstance = jest.SpyInstance

jest.mock('@/src/context')
const getContextMock = mocked(getContext, true)
jest.mock('@/src/unresolvedThread')
const scanPullRequestForUnresolvedReviewThreadsMock = mocked(
  scanPullRequestForUnresolvedReviewThreads,
  true,
)
jest.mock('@/src/label', () => {
  const labelModule = jest.requireActual('@/src/label')
  return {
    ...labelModule,
    addLabel: jest.fn(),
    removeLabel: jest.fn(),
  }
})
const addLabelMock = mocked(addLabel, true)
const removeLabelMock = mocked(removeLabel, true)
jest.mock('@/src/status')
const setCheckStatusAsSuccessMock = mocked(setCheckStatusAsSuccess, true)
const setCheckStatusAsFailureMock = mocked(setCheckStatusAsFailure, true)

describe('handler', () => {
  describe('handleEvent', () => {
    const act = handleEvent
    const octokitClient: PartialOctokitClientMock<any> = {}
    const loggingService: PartialLoggingServiceMock<'info'> = {
      info: jest.fn(),
    }
    const actCall = () => act(loggingService as any, octokitClient as any)
    const repo = generateRepo()
    const pullRequest = generatePullRequest()
    const unresolvedLabel = 'some unresolved label'
    const bypassLabel = 'some bypass label'
    let context: Partial<UnresolvedActionContext>
    let unresolvedThreads: UnresolvedThreads

    beforeEach(() => {
      context = {
        ...repo,
        pullRequest,
        unresolvedLabel,
        bypassLabel,
      }
      unresolvedThreads = {
        anyUnresolved: true,
        numberOfUnresolved: 5,
      }
      getContextMock.mockResolvedValue(context as any)
      scanPullRequestForUnresolvedReviewThreadsMock.mockResolvedValue(unresolvedThreads)
    })

    test('should get context', async () => {
      await actCall()

      expect(getContextMock).toHaveBeenCalledWith(loggingService, octokitClient)
    })

    describe('without check bypass', () => {
      test('should scan pull request for unresolved review threads', async () => {
        await actCall()

        expect(scanPullRequestForUnresolvedReviewThreadsMock).toHaveBeenCalledWith(
          loggingService,
          octokitClient,
          repo.repoOwner,
          repo.repoName,
          pullRequest.number,
        )
      })

      test('should log number of unresolved threads found', async () => {
        await actCall()

        expect(loggingService.info).toHaveBeenCalledWith(
          'Number of unresolved review threads found: 5',
        )
      })

      describe('with unresolved threads', () => {
        test('should add unresolved threads label', async () => {
          await actCall()

          expect(addLabelMock).toHaveBeenCalledWith(
            octokitClient,
            repo.repoOwner,
            repo.repoName,
            pullRequest,
            unresolvedLabel,
          )
        })

        test('should log label addition', async () => {
          await actCall()

          expect(loggingService.info).toHaveBeenCalledWith(
            'Unresolved label trigger added to pull request',
          )
        })

        test('should set check status as failure', async () => {
          await actCall()

          expect(setCheckStatusAsFailureMock).toHaveBeenCalledWith(
            octokitClient,
            context,
            unresolvedThreads.numberOfUnresolved,
          )
        })

        test('should log check failure', async () => {
          await actCall()

          expect(loggingService.info).toHaveBeenCalledWith(
            'Fail status check added to pull request',
          )
        })
      })

      describe('without unresolved threads', () => {
        beforeEach(() => {
          Object.assign(unresolvedThreads, {
            anyUnresolved: false,
            numberOfUnresolved: 0,
          })
        })

        test('should remove unresolved threads label', async () => {
          await actCall()

          expect(removeLabelMock).toHaveBeenCalledWith(
            octokitClient,
            repo.repoOwner,
            repo.repoName,
            pullRequest,
            unresolvedLabel,
          )
        })

        test('should log label removal', async () => {
          await actCall()

          expect(loggingService.info).toHaveBeenCalledWith(
            'Unresolved label trigger removed from pull request',
          )
        })

        test('should set check status as success', async () => {
          await actCall()

          expect(setCheckStatusAsSuccessMock).toHaveBeenCalledWith(octokitClient, context)
        })

        test('should log check success', async () => {
          await actCall()

          expect(loggingService.info).toHaveBeenCalledWith(
            'Success status check added to pull request',
          )
        })
      })
    })

    describe('with check bypass', () => {
      beforeEach(() => {
        pullRequest.labels.push({ name: bypassLabel })
      })

      test('should log bypass detection', async () => {
        await actCall()

        expect(loggingService.info).toHaveBeenCalledWith(
          'Bypass label found on the pull request',
          'Unresolved Threads Check Skipped',
        )
      })

      test('should set check status as success', async () => {
        await actCall()

        expect(setCheckStatusAsSuccessMock).toHaveBeenCalledWith(octokitClient, context)
      })

      test('should log check success', async () => {
        await actCall()

        expect(loggingService.info).toHaveBeenCalledWith(
          'Success status check added to pull request',
        )
      })
    })
  })

  describe('handleError', () => {
    const act = handleError
    const loggingService: PartialLoggingServiceMock<'error'> = {
      error: jest.fn(),
    }
    const actCall = (error: Error) => act(loggingService as any, error)
    let coreErrorSpy: SpyInstance
    let coreSetFailedSpy: SpyInstance

    beforeEach(() => {
      coreErrorSpy = jest.spyOn(core, 'error').mockImplementation()
      coreSetFailedSpy = jest.spyOn(core, 'setFailed').mockImplementation()
    })

    describe('with instance of base error', () => {
      const error = new CustomError('some error name', 'some error description')

      test('should log error using logging service', async () => {
        await actCall(error)

        expect(loggingService.error).toHaveBeenCalledWith(error)
      })

      test('should set workflow as failed', async () => {
        await actCall(error)

        expect(coreSetFailedSpy).toHaveBeenCalledWith(error.description)
      })
    })

    describe('with unrecognized error', () => {
      const error = new Error('some unrecognized error')

      test('should log error using workflow core utility', async () => {
        await actCall(error)

        expect(coreErrorSpy).toHaveBeenCalledWith(JSON.stringify(error.stack, null, 2))
      })

      test('should set workflow as failed', async () => {
        await actCall(error)

        expect(coreSetFailedSpy).toHaveBeenCalledWith('Unexpected Error')
      })
    })
  })
})
