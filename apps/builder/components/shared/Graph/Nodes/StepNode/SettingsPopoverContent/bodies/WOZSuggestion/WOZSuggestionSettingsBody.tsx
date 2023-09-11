import { FormLabel, Stack } from '@chakra-ui/react'
import { WOZSuggestionOptions } from 'models'
import React from 'react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'

type WOZSuggestionSettingBodyProps = {
  options: WOZSuggestionOptions
  onOptionsChange: (options: WOZSuggestionOptions) => void
}

export enum WOZ_ANSWER_TYPE {
  OPENAI = 'da Open AI',
  VERTEXAI = 'da Vertex AI',
  SMALLEST = 'de Menor tamanho',
}

export const WOZSuggestionSettingBody = ({
  options,
  onOptionsChange,
}: WOZSuggestionSettingBodyProps) => {
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
      <iframe src="https://campanhas.octadesk.com/woz" style={{ width: '100%', height: '550px' }} />
    </Stack>
  )
}
