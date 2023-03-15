import { Variable } from '@typebot.io/schemas'

export const parseVariableHtmlTags = (
  content: string,
  variables: Variable[]
) => {
  const varNames = variables.map((variable) => variable.name)
  return content.replace(/\{\{(.*?)\}\}/g, (fullMatch, foundVar) => {
    if (content.includes(`href="{{${foundVar}}}"`)) return fullMatch
    if (varNames.some((val) => foundVar === val)) {
      return `<span style="background-color:#ff8b1a; color:#ffffff; padding: 0.125rem 0.25rem; border-radius: 0.35rem">${fullMatch.replace(
        /{{|}}/g,
        ''
      )}</span>`
    }
    return fullMatch
  })
}
