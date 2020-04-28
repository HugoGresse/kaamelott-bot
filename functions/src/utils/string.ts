export const limitCharCount = (data: string, maxLength: number): string => {
    if (data.length <= maxLength) {
        return data
    }
    const subString = data.substr(0, maxLength - 1)
    return (maxLength
        ? subString.substr(0, subString.lastIndexOf(' '))
        : subString) + "…"
}
