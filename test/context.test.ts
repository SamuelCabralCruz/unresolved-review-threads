import * as faker from 'faker'
import { mocked } from 'ts-jest/utils'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { Context } from '@actions/github/lib/context'

import { getContext } from '@/src/context'
import { NoAssociatedPullRequestError } from '@/src/error/noAssociatedPullRequestError'
import { EventType } from '@/src/eventType'
import { getPullRequest, PullRequest } from '@/src/pullRequest'
import { generatePullRequest } from '@/test/fixture/pullRequest.fixture'
import { generateRepo } from '@/test/fixture/repo.fixture'
import { PartialLoggingServiceMock } from '@/test/typing/loggingService.helper'
import { octokitClientPlaceholderMock } from '@/test/typing/octokit.helper'

jest.mock('@/src/pullRequest')
const getPullRequestMock = mocked(getPullRequest, true)

describe('context', () => {
  describe('getContext', () => {
    const act = getContext
    const loggingService: PartialLoggingServiceMock<'debug'> = {
      debug: jest.fn(),
    }
    const actCall = async () =>
      await act(loggingService as any, octokitClientPlaceholderMock as any)

    let inputs: { [key: string]: string }
    let pullRequest: PullRequest
    let githubContext: Partial<Context>

    const resetMocks = () => {
      inputs = {}
      pullRequest = generatePullRequest()
      githubContext = {
        eventName: 'pull_request',
        payload: {
          action: 'opened',
          pull_request: {
            number: pullRequest.number,
          },
        },
        repo: {
          owner: faker.company.companyName(),
          repo: faker.company.bsNoun(),
        },
      }
    }

    beforeEach(() => {
      resetMocks()
      getPullRequestMock.mockResolvedValue(pullRequest)
      jest.spyOn(core, 'getInput').mockImplementation((name: string): string => inputs[name] || '')
      Object.defineProperty(github, 'context', {
        configurable: true,
        writable: false,
        value: githubContext,
      })
    })

    test('should log github context using logging service', async () => {
      await actCall()

      expect(loggingService.debug).toHaveBeenCalledWith(
        'GitHub Context',
        JSON.stringify(githubContext, null, 2),
      )
    })

    test('should log context using logging service', async () => {
      const observed = await actCall()

      expect(loggingService.debug).toHaveBeenCalledWith(
        'Action Context',
        JSON.stringify(observed, null, 2),
      )
    })

    describe('inputs parsing', () => {
      test('without unresolved label should use default value', async () => {
        const observed = await actCall()

        expect(observed.unresolvedLabel).toEqual('unresolvedThreads')
      })

      test('with unresolved label should use provided value', async () => {
        Object.assign(inputs, { unresolvedLabel: 'some customized value' })

        const observed = await actCall()

        expect(observed.unresolvedLabel).toEqual('some customized value')
      })

      test('without bypass label should use default value', async () => {
        const observed = await actCall()

        expect(observed.bypassLabel).toEqual('ignoreUnresolved')
      })

      test('with bypass label should use provided value', async () => {
        Object.assign(inputs, { bypassLabel: 'some customized value' })

        const observed = await actCall()

        expect(observed.bypassLabel).toEqual('some customized value')
      })

      test.each([
        {},
        {
          unresolvedLabel: 'some customized value',
        },
        {
          bypassLabel: 'some customized value',
        },
        {
          unresolvedLabel: 'some customized value',
          bypassLabel: 'some customized value',
        },
      ])('with valid input configuration should not throw', async (inputsOverrides: any) => {
        Object.assign(inputs, inputsOverrides)

        const observed = await actCall()

        expect(observed).toBeDefined()
      })
    })

    describe('github context parsing', () => {
      test('without pull request associated to event should throw', async () => {
        githubContext.payload!.pull_request = undefined

        await expect(actCall).rejects.toThrowError(NoAssociatedPullRequestError)
      })
    })

    test('should extract context properly', async () => {
      Object.assign(inputs, {
        unresolvedLabel: 'some unresolved label',
      })
      const runId = faker.random.number()
      const { repoOwner, repoName } = generateRepo()
      const workflowName = faker.commerce.department()
      const jobName = faker.commerce.product()
      Object.assign(githubContext, {
        eventName: 'pull_request_review',
        payload: {
          action: 'submitted',
          pull_request: {
            number: faker.random.number(),
          },
        },
        runId,
        workflow: workflowName,
        job: jobName,
        repo: {
          owner: repoOwner,
          repo: repoName,
        },
      })

      const observed = await actCall()

      expect(observed).toMatchObject({
        unresolvedLabel: 'some unresolved label',
        eventType: EventType.PULL_REQUEST_REVIEW_SUBMITTED,
        runId,
        workflowName,
        jobName,
        repoOwner,
        repoName,
        pullRequest,
      })
    })
  })
})
