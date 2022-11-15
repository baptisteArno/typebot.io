import { Parser } from 'htmlparser2'

export const parseHtmlStringToPlainText = (html: string): string => {
  let label = ''
  const parser = new Parser({
    ontext(text) {
      label += `${text}`
    },
  })
  parser.write(html)
  parser.end()
  return label
}
