import { readFile } from 'fs/promises'
export const primitiveTypes = /^(string|number|function|object)$/

export const getExplicitType = async (
	types: Record<string, object>,
	explicitTypeName: string,
	currentFile: string
): Promise<Object | null> => {
	const cachedType = types[explicitTypeName]
	if (cachedType) {
		return cachedType
	}

	if (hasTypeByName(explicitTypeName, currentFile)) {
		return createTypeSchema(
			types,
			getTypeByName(explicitTypeName, currentFile),
			currentFile
		)
	}

	const importPath = getImportString(explicitTypeName, currentFile)
	if (importPath) {
		const typeFile = (
			await readFile(`${importPath === '.' ? './index' : importPath}.ts`)
		).toString()

		return createTypeSchema(
			types,
			getTypeByName(explicitTypeName, typeFile),
			currentFile
		)
	}

	return null
}

async function createTypeSchema(
	types: Record<string, object>,
	typeMatches: RegExpMatchArray | string | null,
	currentFile: string
): Promise<Object | null> {
	if (typeMatches === null) return null

	const matches = typeof typeMatches === 'string' ? typeMatches : typeMatches[2]

	let regex = /['"]*(\w+)['"]*\s*:\s*['"]*(\s*{+\s*[\S\s,]+|\s*\w*)['"]*/gm
	let propertyMatches
	const newType: Record<string, Object | string> = {}

	while ((propertyMatches = regex.exec(matches)) !== null) {
		const property = propertyMatches[1]
		const typeName = propertyMatches[2].replace(',', '').trim()
		if (typeName.match(primitiveTypes) === null) {
			try {
				const keyFinderRegEX = /([{,]\s*)(\S+)\s*(:)/gm
				let convertedJSONString = typeName.replace(keyFinderRegEX, '$1"$2"$3')
				const propertyFinderRegex = /("\s*:)\s*(\w+)/gm
				convertedJSONString = convertedJSONString.replace(
					propertyFinderRegex,
					'$1"$2"'
				)
				const parsed = JSON.parse(convertedJSONString)

				if (parsed instanceof Object) {
					const obj: any = {}

					await Promise.all(
						Object.keys(parsed).map(async (key) => {
							return new Promise<void>(async (resolve) => {
								const keyMatch = await createTypeSchema(
									types,
									JSON.stringify(parsed[key]),
									currentFile
								)
								obj[key] = keyMatch
								resolve()
							})
						})
					)
					// const complexType = await createTypeSchema(
					// 	types,
					// 	regex.exec(typeName),
					// 	currentFile
					// )
					if (obj !== null) newType[property] = obj

					continue
				}
			} catch (err) {
				const explicitType = await getExplicitType(types, typeName, currentFile)
				if (explicitType) newType[property] = explicitType

				continue
			}
		} else {
			newType[property] = typeName
		}
	}
	return newType
}

export function isFunction(str: string) {
	const regex = /(const\s*\w+\s*=\s*\(.*\)\s*=>|function\s*\w+\s*\(.*\))+\s*{/
	return str.match(regex)
}

export function hasFunctionByName(functionName: string, str: string) {
	const regex = new RegExp(
		`(const\\s*${functionName}\\s*=\\s*\\(.*\\)\\s*=>|function\\s*${functionName}\\s*\\(.*\\))+\\s*{(.|\\n)*}`
	)
	return str.match(regex)
}

export function getImportString(importName: string, str: string) {
	const regex = new RegExp(
		`import[\\s\\w\\{\\},]*${importName}[\\s\\w\\{\\},]*from\\s*["']([a-zA-Z\\.\\/]+)["']`
	)
	const match = regex.exec(str)

	if (!match) return null
	return match[1]
}

export function hasTypeByName(typeName: string, str: string) {
	const regex = new RegExp(
		`(interface\\s*${typeName}\\s*|type\\s*${typeName}\\s*=)+\\s*{(.|\\n)*}`
	)
	return str.match(regex)
}

export function getTypeByName(typeName: string, str: string) {
	const regex = new RegExp(
		`(interface\\s*${typeName}|type\\s*${typeName}\\s*=)+\\s*{([\\s\\w:,{}]*)}`
	)
	return regex.exec(str)
}
