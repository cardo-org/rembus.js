import multi from '@rollup/plugin-multi-entry';
import pkg from './package.json';

export default [
	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: ['src/rembus.js'],
		external: ['cbor-x', 'node:crypto', 'isomorphic-ws', 'uuid', 'apache-arrow'],
		output: [
			//{ file: pkg.main, format: 'cjs' },
			{ file: 'dist/rembus.js', format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		],
		plugins: [multi()]
	}
];

