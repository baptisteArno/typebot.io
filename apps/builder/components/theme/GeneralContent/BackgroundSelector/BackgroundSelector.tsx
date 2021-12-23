import { Stack, Text } from '@chakra-ui/react'
import { Background, BackgroundType } from 'bot-engine'
import { deepEqual } from 'fast-equals'
import React, { useEffect, useState } from 'react'
import { BackgroundContent } from './BackgroundContent'
import { BackgroundTypeRadioButtons } from './BackgroundTypeRadioButtons'

type Props = {
  initialBackground?: Background
  onBackgroundChange: (newBackground: Background) => void
}
export const BackgroundSelector = ({
  initialBackground,
  onBackgroundChange,
}: Props) => {
  const [currentBackground, setCurrentBackground] = useState<Background>(
    initialBackground ?? { type: BackgroundType.NONE, content: '' }
  )

  useEffect(() => {
    if (deepEqual(currentBackground, initialBackground)) return
    onBackgroundChange(currentBackground)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBackground])

  const handleBackgroundTypeChange = (type: BackgroundType) =>
    setCurrentBackground({ ...currentBackground, type })

  const handleBackgroundContentChange = (content: string) =>
    setCurrentBackground({ ...currentBackground, content })

  return (
    <Stack spacing={4}>
      <Text>Background</Text>
      <BackgroundTypeRadioButtons
        backgroundType={currentBackground.type}
        onBackgroundTypeChange={handleBackgroundTypeChange}
      />
      <BackgroundContent
        background={currentBackground}
        onBackgroundContentChange={handleBackgroundContentChange}
      />
    </Stack>
  )
}
