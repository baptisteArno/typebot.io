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
  return (
    <Stack spacing={4}>
      <iframe src="https://campanhas.octadesk.com/woz" style={{ width: '100%', height: '550px' }} />
    </Stack>
  )
}
