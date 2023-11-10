module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/test/util/setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/test/util/mocks.ts"],
  moduleNameMapper: {
    "^d3-ease$": "<rootDir>/node_modules/d3-ease/dist/d3-ease.min.js",
    "^react-spring/renderprops$": "<rootDir>/node_modules/react-spring/renderprops.cjs.js",
  }
};
