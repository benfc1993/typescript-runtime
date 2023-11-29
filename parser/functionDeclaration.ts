import { getExplicitType, isFunction, primitiveTypes } from './utils'

export const functionDeclaration = async (
	lines: Array<string>,
	types: Record<string, object>
): Promise<Array<string>> => {
	const hasFunctionDeclaration = lines.findIndex((line: string) =>
		isFunction(line)
	)
	if (!hasFunctionDeclaration) return lines

	const argumentTypes: Record<string, [string, string][]> = {}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		const match = isFunction(line)
		if (!match) continue

		let regex = /([\w-]+)\s*:\s*([\w-]+)/g
		let matches
		argumentTypes[i] = []
		while ((matches = regex.exec(line)) !== null) {
			const argument = matches[1]
			const argumentType = matches[2]

			const isPrimitive = argumentType.match(primitiveTypes)

			if (isPrimitive !== null) {
				argumentTypes[i].push([argument, argumentType])
				continue
			}

			const explicitType = types[argumentType]
			if (explicitType) {
				argumentTypes[i].push([argument, argumentType])
				continue
			}

			const type = await getExplicitType(types, argumentType, lines.join(''))

			argumentTypes[i].push([argument, argumentType])

			if (type) types[argumentType] = type
		}
	}

	// argumentNames {}
	// typesObject {argumentName: type}

	Object.entries(argumentTypes).forEach(([lineIndex, argumentTypes]) => {
		if (argumentTypes.length > 0) {
			let safeGuard = 'if('
			argumentTypes.forEach((argumentType, index) => {
				if (index > 0) safeGuard += '||'
				if (argumentType[1].match(primitiveTypes))
					safeGuard += `typeof ${argumentType[0]} !== \'${argumentType[1]}\'`
				else
					safeGuard += `!typeIsValid(${argumentType[0]}, ${JSON.stringify(
						types[argumentType[1]]
					)})`
			})
			safeGuard += ") throw new Error('invalid type passed')"
			lines[parseInt(lineIndex)] += safeGuard
		}
	})
	lines.unshift('import {typeIsValid} from "./parser/typeIsValid"')
	return lines
}
