import { BotProps } from '@typebot.io/js'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { parseBotProps, typebotImportUrl } from './shared'

export const parseInitStandardCode = ({
  typebot,
  apiHost,
}: Pick<BotProps, 'typebot' | 'apiHost'>) => {
  const botProps = parseBotProps({ typebot, apiHost })

  return prettier.format(
    `import Typebot from '${typebotImportUrl}'
  
  Typebot.initStandard({${botProps}});`,
    {
      parser: 'babel',
      plugins: [parserBabel],
    }
  )
}
