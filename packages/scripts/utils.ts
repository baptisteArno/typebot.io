import { join } from 'path'
import prompts from 'prompts'
import { isEmpty } from '@typebot.io/lib'

export const promptAndSetEnvironment = async (
  skipPrompt?: 'local' | 'staging' | 'production'
) => {
  const response = skipPrompt
    ? { env: skipPrompt }
    : await prompts({
        type: 'select',
        name: 'env',
        message: 'Pick an environment',
        choices: [
          {
            title: 'Local',
            value: 'local',
          },
          { title: 'Staging', value: 'staging' },
          { title: 'Production', value: 'production' },
        ],
        initial: 0,
      })

  if (isEmpty(response.env)) process.exit()

  require('dotenv').config({
    override: true,
    path: join(__dirname, `.env.${response.env}`),
  })
}
