import esbuild from 'esbuild'
import { exampleOnLoadPlugin } from './parser'

const build = async () => {
	await esbuild.build({
		entryPoints: ['index.ts'],
		bundle: true,
		outfile: 'out.js',
		plugins: [exampleOnLoadPlugin],
		minify: false,
		tsconfig: './tsconfig.json'
	})
}
console.time('bundle')
build()
console.timeEnd('bundle')
