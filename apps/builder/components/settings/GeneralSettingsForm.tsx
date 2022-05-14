import {
  Flex,
  FormLabel,
  Stack,
  Switch,
  Tag,
  useDisclosure,
} from '@chakra-ui/react'
import { UpgradeModal } from 'components/shared/modals/UpgradeModal'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { GeneralSettings } from 'models'
import React from 'react'
import { isFreePlan } from 'services/workspace'

type Props = {
  generalSettings: GeneralSettings
  onGeneralSettingsChange: (generalSettings: GeneralSettings) => void
}

export const GeneralSettingsForm = ({
  generalSettings,
  onGeneralSettingsChange,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { workspace } = useWorkspace()
  const isUserFreePlan = isFreePlan(workspace)
  const handleSwitchChange = () => {
    if (generalSettings?.isBrandingEnabled && isUserFreePlan) return
    onGeneralSettingsChange({
      ...generalSettings,
      isBrandingEnabled: !generalSettings?.isBrandingEnabled,
    })
  }

  const handleNewResultOnRefreshChange = (
    isNewResultOnRefreshEnabled: boolean
  ) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isNewResultOnRefreshEnabled,
    })

  const handleInputPrefillChange = (isInputPrefillEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isInputPrefillEnabled,
    })

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
      <SwitchWithLabel
        id="prefill"
        label="Prefill input"
        initialValue={generalSettings.isInputPrefillEnabled ?? true}
        onCheckChange={handleInputPrefillChange}
        moreInfoContent="Inputs are automatically pre-filled whenever its saving variable has a value"
      />
      <SwitchWithLabel
        id="new-result"
        label="Create new session on page refresh"
        initialValue={generalSettings.isNewResultOnRefreshEnabled ?? false}
        onCheckChange={handleNewResultOnRefreshChange}
      />
    </Stack>
  )
}
