const esModules = ["@rdfjs/term-map", "@rdfjs/term-set"];

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
  },
  transformIgnorePatterns: [`node_modules/(?!${esModules.join("|")})`],
};
