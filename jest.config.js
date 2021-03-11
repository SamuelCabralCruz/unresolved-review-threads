module.exports = {
  // general
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  testEnvironment: 'node',
  errorOnDeprecated: true,
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleNameMapper: {
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/test/(.*)$': '<rootDir>/test/$1',
  },
  testMatch: ['**/?(*.)+(test).+(ts)'],
  transform: { '^.+\\.(test).ts$': 'ts-jest' },
  // mocks
  clearMocks: true,
  resetMocks: true,
  resetModules: true,
  restoreMocks: true,
  // coverage
  collectCoverage: true,
  collectCoverageFrom: ['!node_modules/*', '!dist/*', '!lib/*', 'src/**/*.{js,ts}'],
  coverageReporters: ['json'],
  coverageThreshold: undefined,
}
