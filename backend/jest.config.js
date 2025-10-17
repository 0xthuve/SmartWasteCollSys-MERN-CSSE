export default {
  testEnvironment: 'node',
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  verbose: true,
  setupFilesAfterEnv: ['./jest.setup.js'],
}
