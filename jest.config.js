const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  modulePathIgnorePatterns: ['test.js'],
  modulePaths: ['<rootDir>/'],
  moduleNameMapper: {
    '@domain/(.*)': '<rootDir>/src/1-domain/$1',
    '@application/(.*)': '<rootDir>/src/2-application/$1',
    '@infrastructure/(.*)': '<rootDir>/src/3-infrastructure/$1',
    '@utils/(.*)': '<rootDir>/src/utils/$1',
  },
  setupFiles: ['dotenv/config'],
  silent: false,
  verbose: true,
};
