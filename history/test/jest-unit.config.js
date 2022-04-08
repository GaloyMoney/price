module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "../",
  roots: ["<rootDir>/test/unit", "<rootDir>/src"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
  testRegex: ".*\\.spec\\.ts$",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@app$": ["<rootDir>src/app/index"],
    "^@config$": ["<rootDir>src/config/index"],
    "^@domain/(.*)$": ["<rootDir>src/domain/$1"],
    "^@servers/(.*)$": ["<rootDir>src/servers/$1"],
    "^@services/(.*)$": ["<rootDir>src/services/$1"],
    "^test/(.*)$": ["<rootDir>test/$1"],
    "^@utils$": ["<rootDir>src/utils/index"],
  },
}
