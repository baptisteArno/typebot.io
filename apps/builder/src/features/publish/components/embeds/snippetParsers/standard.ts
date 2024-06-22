import { BotProps } from '@sniper.io/nextjs'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { parseBotProps } from './shared'

export const parseInitStandardCode = ({
  sniper,
  apiHost,
}: Pick<BotProps, 'sniper' | 'apiHost'>) => {
  const botProps = parseBotProps({ sniper, apiHost })

  return prettier.format(`Sniper.initStandard({${botProps}});`, {
    parser: 'babel',
    plugins: [parserBabel],
  })
}
