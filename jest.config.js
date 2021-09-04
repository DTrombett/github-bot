/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
	testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
	testEnvironment: "node",
	clearMocks: true,
	collectCoverage: true,
	collectCoverageFrom: ["src/**/*.ts"],
	coverageDirectory: "coverage",
	coverageProvider: "v8",
	coverageReporters: ["text", "lcov", "clover"],
	coverageThreshold: {
		global: {
			branches: 70,
			lines: 70,
			statements: 70,
		},
	},
	coveragePathIgnorePatterns: ["src/index.ts"],
};
