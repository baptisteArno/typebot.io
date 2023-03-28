import { RadioButtons } from '@/components/inputs/RadioButtons'
import { Stack, Text } from '@chakra-ui/react'
import { Background, BackgroundType } from '@typebot.io/schemas'
import React from 'react'
import { BackgroundContent } from './BackgroundContent'

type Props = {
  background?: Background
  onBackgroundChange: (newBackground: Background) => void
}

const defaultBackgroundType = BackgroundType.NONE

export const BackgroundSelector = ({
  background,
  onBackgroundChange,
}: Props) => {
  const handleBackgroundTypeChange = (type: BackgroundType) =>
    background &&
    onBackgroundChange({ ...background, type, content: undefined })

  const handleBackgroundContentChange = (content: string) =>
    background && onBackgroundChange({ ...background, content })

  return (
    <Stack spacing={4}>
      <Text>Background</Text>
      <RadioButtons
        options={[
          BackgroundType.COLOR,
          BackgroundType.IMAGE,
          BackgroundType.NONE,
        ]}
        value={background?.type ?? defaultBackgroundType}
        onSelect={handleBackgroundTypeChange}
      />
      <BackgroundContent
        background={background}
        onBackgroundContentChange={handleBackgroundContentChange}
      />
    </Stack>
  )
}
