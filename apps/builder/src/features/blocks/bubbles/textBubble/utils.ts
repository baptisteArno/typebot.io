import { Parser } from 'htmlparser2'
import { isNotEmpty } from '@typebot.io/lib'

export const parseHtmlStringToPlainText = (html: string): string => {
  let plainText = ''
  const parser = new Parser({
    onopentag(name) {
      if (name === 'div' && isNotEmpty(plainText)) plainText += '\n'
    },
    ontext(text) {
      plainText += `${text}`
    },
  })
  parser.write(html)
  parser.end()
  return plainText
}
