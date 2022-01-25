import { Flex, FormLabel, Stack, Switch, Text } from '@chakra-ui/react'
import { GeneralSettings } from 'models'
import React from 'react'

type Props = {
  generalSettings: GeneralSettings
  onGeneralSettingsChange: (generalSettings: GeneralSettings) => void
}

export const GeneralSettingsForm = ({
  generalSettings,
  onGeneralSettingsChange,
}: Props) => {
  const handleSwitchChange = () =>
    onGeneralSettingsChange({
      isBrandingEnabled: !generalSettings?.isBrandingEnabled,
    })

  return (
    <Stack spacing={6}>
      <Flex justifyContent="space-between" align="center">
        <FormLabel htmlFor="branding" mb="0">
          Typebot.io branding
        </FormLabel>
        <Switch
          id="branding"
          isChecked={generalSettings.isBrandingEnabled}
          onChange={handleSwitchChange}
        />
      </Flex>
    </Stack>
  )
}
