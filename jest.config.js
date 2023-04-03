/* eslint-disable no-undef */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/tests/*.test.ts"],
};
