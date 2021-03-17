import * as faker from 'faker'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { Context } from '@actions/github/lib/context'

import { getContext } from '@/src/context'
import { AtLeastOneTriggerOptionEnabledError } from '@/src/error/atLeastOneTriggerOptionEnabledError'
import { DefinedDeleteResolvedCommentWithDisabledTriggerError } from '@/src/error/definedDeleteResolvedCommentWithDisabledTriggerError'
import { DefinedResolvedCommentWithDisabledTriggerError } from '@/src/error/definedResolvedCommentWithDisabledTriggerError'
import { DefinedUnresolvedLabelWithDisabledTriggerError } from '@/src/error/definedUnresolvedLabelWithDisabledTriggerError'
import { InvalidBooleanInputError } from '@/src/error/invalidBooleanInputError'
import { InvalidEventTypeError } from '@/src/error/invalidEventTypeError'
import { NoAssociatedPullRequestError } from '@/src/error/noAssociatedPullRequestError'
import { EventType } from '@/src/eventType'
import { generateRepo } from '@/test/fixture/repo.fixture'
import { PartialLoggingServiceMock } from '@/test/typing/loggingService.helper'
import { PartialOctokitClientMock } from '@/test/typing/octokit.helper'

describe('context', () => {
  describe('getContext', () => {
    const act = getContext
    const loggingService: PartialLoggingServiceMock<'debug'> = {
      debug: jest.fn(),
    }
    const octokitClient: PartialOctokitClientMock<any> = {}

    const actCall = async () => await act(loggingService as any, octokitClient as any)

    let inputs: { [key: string]: string }
    let githubContext: Partial<Context>

    beforeEach(() => {
      inputs = {}
      jest.spyOn(core, 'getInput').mockImplementation((name: string): string => inputs[name] || '')
      githubContext = {
        eventName: 'pull_request',
        payload: {
          action: 'opened',
          pull_request: {
            number: faker.random.number(),
            head: {
              sha: faker.git.commitSha(),
            },
          },
        },
        repo: {
          owner: faker.company.companyName(),
          repo: faker.company.bsNoun(),
        },
      }
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
      test('without use label trigger should use default value', async () => {
        const observed = await actCall()

        expect(observed.useLabelTrigger).toBe(true)
      })

      test('with invalid use label trigger input should throw', async () => {
        inputs['useLabelTrigger'] = 'invalid'

        await expect(actCall).rejects.toThrowError(InvalidBooleanInputError)
      })

      test('without unresolved label should use default value', async () => {
        const observed = await actCall()

        expect(observed.unresolvedLabel).toEqual('unresolvedThreads')
      })

      test('without use comment trigger should use default value', async () => {
        const observed = await actCall()

        expect(observed.useCommentTrigger).toBe(false)
      })

      test('without resolved comment trigger should use default value', async () => {
        const observed = await actCall()

        expect(observed.resolvedCommentTrigger).toEqual('LGTM')
      })

      test('without delete resolved comment trigger should use default value', async () => {
        const observed = await actCall()

        expect(observed.deleteResolvedCommentTrigger).toBe(true)
      })

      test('without delete resolved comment trigger should use default value', async () => {
        const observed = await actCall()

        expect(observed.deleteResolvedCommentTrigger).toBe(true)
      })

      test('with invalid use comment trigger input should throw', async () => {
        inputs['useCommentTrigger'] = 'invalid'

        await expect(actCall).rejects.toThrowError(InvalidBooleanInputError)
      })

      test('without enabled trigger should throw', async () => {
        inputs['useLabelTrigger'] = 'false'
        inputs['useCommentTrigger'] = 'false'

        await expect(actCall).rejects.toThrowError(AtLeastOneTriggerOptionEnabledError)
      })

      test('with disabled label trigger and unresolved label override should throw', async () => {
        inputs['useLabelTrigger'] = 'false'
        inputs['unresolvedLabel'] = 'some customized value'
        inputs['useCommentTrigger'] = 'true'

        await expect(actCall).rejects.toThrowError(DefinedUnresolvedLabelWithDisabledTriggerError)
      })

      test('with disabled comment trigger and resolved comment trigger override should throw', async () => {
        inputs['resolvedCommentTrigger'] = 'some customized value'

        await expect(actCall).rejects.toThrowError(DefinedResolvedCommentWithDisabledTriggerError)
      })

      test('with disabled comment trigger and delete resolved comment trigger override should throw', async () => {
        inputs['deleteResolvedCommentTrigger'] = 'false'

        await expect(actCall).rejects.toThrowError(
          DefinedDeleteResolvedCommentWithDisabledTriggerError,
        )
      })

      test.each([
        {
          unresolvedLabel: 'some customized value',
        },
        {
          useLabelTrigger: 'true',
          unresolvedLabel: 'some customized value',
        },
        {
          useLabelTrigger: 'false',
          useCommentTrigger: 'true',
        },
        {
          useCommentTrigger: 'true',
        },
        {
          useCommentTrigger: 'true',
          resolvedCommentTrigger: 'some customized value',
        },
        {
          useCommentTrigger: 'true',
          deleteResolvedCommentTrigger: 'false',
        },
        {
          useCommentTrigger: 'true',
          deleteResolvedCommentTrigger: 'true',
        },
        {
          useLabelTrigger: 'false',
          useCommentTrigger: 'true',
          resolvedCommentTrigger: 'some customized value',
        },
        {
          useLabelTrigger: 'false',
          useCommentTrigger: 'true',
          resolvedCommentTrigger: 'some customized value',
          deleteResolvedCommentTrigger: 'false',
        },
        {
          useLabelTrigger: 'true',
          unresolvedLabel: 'some customized value',
          useCommentTrigger: 'true',
          resolvedCommentTrigger: 'some customized value',
          deleteResolvedCommentTrigger: 'false',
        },
      ])('with valid input configuration should not throw', async (inputsOverrides: any) => {
        Object.assign(inputs, inputsOverrides)

        const observed = await actCall()

        expect(observed).toBeDefined()
      })
    })

    describe('github context parsing', () => {
      test.each([
        ['', 'opened'],
        ['pull_request', ''],
        ['pull_request', 'created'],
      ])('with unknown event type should throw', async (eventName: string, eventAction: string) => {
        githubContext.eventName = eventName
        githubContext.payload!.action = eventAction

        await expect(actCall).rejects.toThrowError(InvalidEventTypeError)
      })

      test('without pull request associated to event should throw', async () => {
        githubContext.payload!.pull_request = undefined

        await expect(actCall).rejects.toThrowError(NoAssociatedPullRequestError)
      })
    })

    test('should extract common context properly', async () => {
      Object.assign(inputs, {
        useLabelTrigger: 'true',
        unresolvedLabel: 'some unresolved label',
        useCommentTrigger: 'true',
        resolvedCommentTrigger: 'some resolved comment trigger',
        deleteResolvedCommentTrigger: 'false',
      })
      const runId = faker.random.number()
      const { repoOwner, repoName } = generateRepo()
      const workflowName = faker.commerce.department()
      const jobName = faker.commerce.product()
      Object.assign(githubContext, {
        eventName: 'pull_request_review_comment',
        payload: {
          action: 'created',
          pull_request: {
            number: faker.random.number(),
            head: {
              sha: faker.git.commitSha(),
            },
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
        useLabelTrigger: true,
        unresolvedLabel: 'some unresolved label',
        useCommentTrigger: true,
        resolvedCommentTrigger: 'some resolved comment trigger',
        deleteResolvedCommentTrigger: false,
        eventType: EventType.PULL_REQUEST_REVIEW_COMMENT_CREATED,
        triggerType: 'other',
        runId,
        workflowName,
        jobName,
        repoOwner,
        repoName,
        labelTriggeredEvent: false,
        commentTriggeredEvent: false,
        shouldProcessEvent: true,
      })
    })
  })
})
