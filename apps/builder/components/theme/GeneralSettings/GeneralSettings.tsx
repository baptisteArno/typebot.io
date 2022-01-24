import { Stack } from '@chakra-ui/react'
import { Background, BackgroundType, GeneralTheme } from 'models'
import React from 'react'
import { BackgroundSelector } from './BackgroundSelector'
import { FontSelector } from './FontSelector'

type Props = {
  generalTheme?: GeneralTheme
  onGeneralThemeChange: (general: GeneralTheme) => void
}

const defaultFont = 'Open Sans'

export const GeneralSettings = ({
  generalTheme,
  onGeneralThemeChange,
}: Props) => {
  const handleSelectFont = (font: string) =>
    onGeneralThemeChange({ ...generalTheme, font })

  const handleBackgroundChange = (background: Background) =>
    onGeneralThemeChange({ ...generalTheme, background })

  return (
    <Stack spacing={6}>
      <FontSelector
        activeFont={generalTheme?.font ?? defaultFont}
        onSelectFont={handleSelectFont}
      />
      <BackgroundSelector
        background={generalTheme?.background ?? { type: BackgroundType.NONE }}
        onBackgroundChange={handleBackgroundChange}
      />
    </Stack>
  )
}
