import faker from 'faker'

import { addLabel, removeLabel } from '@/src/label'
import { generateN } from '@/test/fixture/generateN.fixture'
import { generateLabel, generatePullRequest } from '@/test/fixture/pullRequest.fixture'
import { generateRepo } from '@/test/fixture/repo.fixture'
import { PartialOctokitClientMock } from '@/test/typing/octokit.helper'

describe('label', () => {
  const { repoOwner, repoName } = generateRepo()
  const labelName = faker.lorem.word()
  const pullRequest = generatePullRequest()
  const pullRequestWithSpecificLabel = generatePullRequest({
    labels: [...generateN(generateLabel), { name: labelName }],
  })

  describe('addLabel', () => {
    const act = addLabel
    const octokit: PartialOctokitClientMock<'issues', 'addLabels'> = {
      issues: {
        addLabels: jest.fn(),
      },
    }

    test('with pull request not already labeled should add label using octokit', async () => {
      await act(octokit as any, repoOwner, repoName, pullRequest, labelName)

      expect(octokit.issues.addLabels).toHaveBeenCalledWith({
        owner: repoOwner,
        repo: repoName,
        issue_number: pullRequest.number,
        labels: [labelName],
      })
    })

    test('with pull request already labeled should not add label using octokit', async () => {
      await act(octokit as any, repoOwner, repoName, pullRequestWithSpecificLabel, labelName)

      expect(octokit.issues.addLabels).not.toHaveBeenCalled()
    })
  })

  describe('removeLabel', () => {
    const act = removeLabel
    const octokit: PartialOctokitClientMock<'issues', 'removeLabel'> = {
      issues: {
        removeLabel: jest.fn(),
      },
    }

    test('with pull request having the specified label should remove label using octokit', async () => {
      await act(octokit as any, repoOwner, repoName, pullRequestWithSpecificLabel, labelName)

      expect(octokit.issues.removeLabel).toHaveBeenCalledWith({
        owner: repoOwner,
        repo: repoName,
        issue_number: pullRequestWithSpecificLabel.number,
        name: labelName,
      })
    })

    test('with pull request not having specified label should not remove label using octokit', async () => {
      await act(octokit as any, repoOwner, repoName, pullRequest, labelName)

      expect(octokit.issues.removeLabel).not.toHaveBeenCalled()
    })
  })
})
