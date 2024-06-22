export const duplicateName = (name: string | `${string} (${number})`) => {
  const match = name.match(/^(.*) \((\d+)\)$/)
  if (!match) return `${name} (1)`
  const [, nameWithoutNumber, number] = match
  return `${nameWithoutNumber} (${Number(number) + 1})`
}
