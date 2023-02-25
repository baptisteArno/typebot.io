import { BotProps } from '@typebot.io/js'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { parseBotProps } from './shared'

export const parseInitStandardCode = ({
  typebot,
  apiHost,
}: Pick<BotProps, 'typebot' | 'apiHost'>) => {
  const botProps = parseBotProps({ typebot, apiHost })

  return prettier.format(`Typebot.initStandard({${botProps}});`, {
    parser: 'babel',
    plugins: [parserBabel],
  })
}
