/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
	testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
	testEnvironment: "node",
	clearMocks: true,
	collectCoverage: true,
	collectCoverageFrom: ["src/**/*.ts"],
	coverageDirectory: "coverage",
	coverageProvider: "babel",
	coverageReporters: ["text", "lcov", "clover"],
	coveragePathIgnorePatterns: [
		"/node_modules/",
		"<rootDir>/src/*.ts",
		"<rootDir>/src/commands/*.ts",
	],
	testPathIgnorePatterns: ["/node_modules/", "<rootDir>/src/*.ts", "<rootDir>/src/commands/*.ts"],
};
