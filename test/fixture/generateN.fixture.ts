import * as faker from 'faker'

export const generateN = <T>(
  generator: () => T,
  n: number = faker.random.number({ min: 1, max: 10 }),
): T[] =>
  Array(n)
    .fill(null)
    .map(() => generator())
