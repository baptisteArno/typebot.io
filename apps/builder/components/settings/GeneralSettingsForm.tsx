import {
  Flex,
  FormLabel,
  Stack,
  Switch,
  Tag,
  useDisclosure,
} from '@chakra-ui/react'
import { UpgradeModal } from 'components/shared/modals/UpgradeModal.'
import { useUser } from 'contexts/UserContext'
import { GeneralSettings } from 'models'
import React from 'react'
import { isFreePlan } from 'services/user'

type Props = {
  generalSettings: GeneralSettings
  onGeneralSettingsChange: (generalSettings: GeneralSettings) => void
}

export const GeneralSettingsForm = ({
  generalSettings,
  onGeneralSettingsChange,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useUser()
  const isUserFreePlan = isFreePlan(user)
  const handleSwitchChange = () => {
    if (generalSettings?.isBrandingEnabled && isUserFreePlan) return
    onGeneralSettingsChange({
      isBrandingEnabled: !generalSettings?.isBrandingEnabled,
    })
  }

  return (
    <Stack spacing={6}>
      <UpgradeModal isOpen={isOpen} onClose={onClose} />
      <Flex
        justifyContent="space-between"
        align="center"
        onClick={isUserFreePlan ? onOpen : undefined}
      >
        <FormLabel htmlFor="branding" mb="0">
          Typebot.io branding{' '}
          {isUserFreePlan && <Tag colorScheme="orange">Pro</Tag>}
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
