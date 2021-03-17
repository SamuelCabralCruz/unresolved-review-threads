import * as faker from 'faker'
import { GitHub } from '@actions/github/lib/utils'

import { UndefinedGitHubTokenError } from '@/src/error/undefinedGitHubTokenError'
import { getOctokitClient } from '@/src/octokitClient'

describe('OctokitInstance', () => {
  describe('getOctokitInstance', () => {
    const act = getOctokitClient

    beforeEach(() => {
      process.env = {}
    })

    test('without github token environment variable should throw', () => {
      expect(act).toThrowError(UndefinedGitHubTokenError)
    })

    test('should return github instance', () => {
      process.env.GITHUB_TOKEN = faker.git.commitSha()

      const observed = act()

      expect(observed).toBeInstanceOf(GitHub)
    })
  })
})
