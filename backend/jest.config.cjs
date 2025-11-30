
module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  transform: {},


  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/index.js",
    "!src/**/migration.js"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },

  transformIgnorePatterns: ['/node_modules/']
}
