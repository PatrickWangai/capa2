/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js'],
  // setupFilesAfterEnv/AfterFramework options are version-specific; keep config minimal for compatibility.

  testTimeout: 30000,
};
