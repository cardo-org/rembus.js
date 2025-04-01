import multi from '@rollup/plugin-multi-entry';
import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
	{
		input: ['src/rembus.js'],
		external: ['cbor-x', 'node:crypto', 'isomorphic-ws', 'uuid', 'apache-arrow'],
		output: [
			{ file: pkg.module, format: 'es', exports: 'named' }
		],
		plugins: [
			multi(),
			resolve(),//add resolve
			commonjs()// add commonjs
		]
	},
	{
		input: ['src/rembus.js'], // Use the same input file
		output: {
			file: 'dist/rembus.umd.js', // Output file for UMD
			format: 'umd', // UMD format
			name: 'Rembus', // Global variable name
			globals: { // Global dependencies
				'cbor-x': 'cborX', // Adjust globals if necessary
				'uuid': 'uuid',
				'apache-arrow': 'Arrow',
				'isomorphic-ws': 'WebSocket'
			},
			exports: 'named'
		},
		plugins: [
			resolve({ browser: true }),
			commonjs()
		]
	}
];

