import { Plugin } from 'esbuild'
import { readFile } from 'fs/promises'
import { functionDeclaration } from './functionDeclaration'

const types: Record<string, Object> = {}

export const exampleOnLoadPlugin: Plugin = {
	name: 'example',
	setup(build) {
		// Load ".txt" files and return an array of words
		build.onLoad({ filter: /\.ts$/ }, async (args) => {
			let text = await readFile(args.path, 'utf8')
			let lines: string[] = text.split('\n')
			lines = await functionDeclaration(lines, types)

			return {
				contents: lines.join('\n'),
				loader: 'ts'
			}
		})
	}
}
