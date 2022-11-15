import { Flex, FormLabel, Stack, Switch, useDisclosure } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace'
import { Plan } from 'db'
import { GeneralSettings } from 'models'
import React from 'react'
import { isDefined } from 'utils'
import { ChangePlanModal, isFreePlan, LimitReached } from '@/features/billing'
import { SwitchWithLabel } from '@/components/SwitchWithLabel'
import { LockTag } from '@/features/billing'

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
  const isWorkspaceFreePlan = isFreePlan(workspace)
  const handleSwitchChange = () => {
    if (generalSettings?.isBrandingEnabled && isWorkspaceFreePlan) return
    onGeneralSettingsChange({
      ...generalSettings,
      isBrandingEnabled: !generalSettings?.isBrandingEnabled,
    })
  }

  const handleNewResultOnRefreshChange = (isRememberSessionChecked: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isNewResultOnRefreshEnabled: !isRememberSessionChecked,
    })

  const handleInputPrefillChange = (isInputPrefillEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isInputPrefillEnabled,
    })

  const handleHideQueryParamsChange = (isHideQueryParamsEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isHideQueryParamsEnabled,
    })

  return (
    <Stack spacing={6}>
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={LimitReached.BRAND}
      />
      <Flex
        justifyContent="space-between"
        align="center"
        onClick={isWorkspaceFreePlan ? onOpen : undefined}
      >
        <FormLabel htmlFor="branding" mb="0">
          Typebot.io branding{' '}
          {isWorkspaceFreePlan && <LockTag plan={Plan.STARTER} />}
        </FormLabel>
        <Switch
          id="branding"
          isChecked={generalSettings.isBrandingEnabled}
          onChange={handleSwitchChange}
        />
      </Flex>
      <SwitchWithLabel
        label="Prefill input"
        initialValue={generalSettings.isInputPrefillEnabled ?? true}
        onCheckChange={handleInputPrefillChange}
        moreInfoContent="Inputs are automatically pre-filled whenever their associated variable has a value"
      />
      <SwitchWithLabel
        label="Remember session"
        initialValue={
          isDefined(generalSettings.isNewResultOnRefreshEnabled)
            ? !generalSettings.isNewResultOnRefreshEnabled
            : true
        }
        onCheckChange={handleNewResultOnRefreshChange}
        moreInfoContent="If the user refreshes the page, its existing results will be overwritten. Disable this if you want to create a new results every time the user refreshes the page."
      />
      <SwitchWithLabel
        label="Hide query params on bot start"
        initialValue={generalSettings.isHideQueryParamsEnabled ?? true}
        onCheckChange={handleHideQueryParamsChange}
        moreInfoContent="If your URL contains query params, they will be automatically hidden when the bot starts."
      />
    </Stack>
  )
}
