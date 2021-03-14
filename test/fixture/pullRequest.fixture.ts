import faker from 'faker'

import { Label, PullRequest } from '@/src/pullRequest'
import { generateN } from '@/test/fixture/generateN.fixture'

export const generateLabel = (args: Partial<Label> = {}): Label => ({
  name: args.name ?? faker.lorem.word(),
})

export const generatePullRequest = (args: Partial<PullRequest> = {}): PullRequest => ({
  number: args.number ?? faker.random.number(),
  headRef: args.headRef ?? faker.git.commitSha(),
  labels: args.labels ?? generateN(generateLabel),
})
