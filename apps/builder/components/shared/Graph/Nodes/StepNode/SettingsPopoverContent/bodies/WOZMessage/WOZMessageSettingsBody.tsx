import { FormLabel, Stack } from '@chakra-ui/react'
import { WOZMessageOptions } from 'models'
import React from 'react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'

type WOZMessageSettingBodyProps = {
  options: WOZMessageOptions
  onOptionsChange: (options: WOZMessageOptions) => void
}

export enum WOZ_ANSWER_TYPE {
  OPENAI = 'da Open AI',
  VERTEXAI = 'da Vertex AI',
  SMALLEST = 'de Menor tamanho',
}

export const WOZMessageSettingBody = ({
  options,
  onOptionsChange,
}: WOZMessageSettingBodyProps) => {
  const handleDefaultPreferredAnswer = (e: any) => {
    const option = e

    onOptionsChange({
      ...options,
      preferredAnswer: option,
    })
  }

  const items = Object.entries(WOZ_ANSWER_TYPE).map((type) => {
    return {
      value: type[0],
      label: type[1],
      key: type[0],
      optionKey: type[0]
    }
  })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Enviar a sugestão:
        </FormLabel>
        (
        <OctaSelect
          placeholder="Selecione..."
          defaultSelected={options?.preferredAnswer}
          value={options?.preferredAnswer}
          findable
          options={items}
          onChange={handleDefaultPreferredAnswer}
        />
      </Stack>
    </Stack>
  )
}
