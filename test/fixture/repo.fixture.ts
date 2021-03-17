import faker from 'faker'

type Repo = {
  repoOwner: string
  repoName: string
}

export const generateRepo = (): Repo => ({
  repoOwner: faker.name.findName(),
  repoName: faker.name.jobArea(),
})
