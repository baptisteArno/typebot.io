import { Flex, FormLabel, Stack, Switch, useDisclosure } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Plan } from '@typebot.io/prisma'
import { GeneralSettings } from '@typebot.io/schemas'
import React from 'react'
import { isDefined } from '@typebot.io/lib'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { ChangePlanModal } from '@/features/billing/components/ChangePlanModal'
import { LockTag } from '@/features/billing/components/LockTag'
import { isFreePlan } from '@/features/billing/helpers/isFreePlan'
import { useI18n } from '@/locales'

type Props = {
  generalSettings: GeneralSettings
  onGeneralSettingsChange: (generalSettings: GeneralSettings) => void
}

export const GeneralSettingsForm = ({
  generalSettings,
  onGeneralSettingsChange,
}: Props) => {
  const t = useI18n()
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
        type={t('billing.limitMessage.brand')}
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
        moreInfoContent="If the user refreshes the page or opens the typebot again during the same session, his previous variables will be prefilled and his new answers will override the previous ones."
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
