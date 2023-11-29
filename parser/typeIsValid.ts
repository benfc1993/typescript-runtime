export function typeIsValid<
    T extends Record<string, any>,
    K extends Record<string, any>
>(input: T, validation: K) {
    if (!Object.keys(input).every((key) => validation.hasOwnProperty(key)))
        return false

    for (const [key, type] of Object.entries(validation)) {
        const inputValue = input[key]
        if (typeof type === 'object' && typeof inputValue === 'object') {
            if (!typeIsValid(inputValue, validation[key])) return false
        }
        if (
            (type instanceof Object && typeof inputValue !== 'object') ||
            (typeof type === 'string' && typeof inputValue !== type)
        )
            return false
    }
    return true
}
