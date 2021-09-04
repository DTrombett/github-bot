/** @type {import('@babel/core').TransformOptions} */
module.exports = {
	parserOpts: { strictMode: true },
	sourceMaps: true,
	presets: [
		[
			"@babel/preset-env",
			{
				targets: { node: "current" },
				modules: "commonjs",
			},
		],
		"@babel/preset-typescript",
	],
};
