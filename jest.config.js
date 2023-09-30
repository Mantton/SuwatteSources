/* eslint-disable no-undef */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  forceExit: true,
  verbose: true,
  clearMocks: true,
};
