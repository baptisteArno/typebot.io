import { Stack, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import React from 'react'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { CopyButton } from '@/components/CopyButton'
import { CollaborationList } from '@/features/collaboration/components/CollaborationList'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { useTranslate } from '@tolgee/react'

export const SharePopoverContent = () => {
  const { t } = useTranslate()
  const { sniper, updateSniper } = useSniper()

  const currentUrl = `${window.location.origin}/snipers/${sniper?.id}/edit`

  const updateIsPublicShareEnabled = async (isEnabled: boolean) => {
    await updateSniper({
      updates: {
        settings: {
          ...sniper?.settings,
          publicShare: {
            ...sniper?.settings.publicShare,
            isEnabled,
          },
        },
      },
      save: true,
    })
  }

  return (
    <Stack spacing={4}>
      <CollaborationList />
      <Stack p="4" borderTopWidth={1}>
        <SwitchWithRelatedSettings
          label={t('share.button.popover.publicFlow.label')}
          initialValue={sniper?.settings.publicShare?.isEnabled ?? false}
          onCheckChange={updateIsPublicShareEnabled}
        >
          <Stack spacing={4}>
            <InputGroup size="sm">
              <Input type={'text'} defaultValue={currentUrl} pr="16" />
              <InputRightElement width="60px">
                <CopyButton size="sm" textToCopy={currentUrl} />
              </InputRightElement>
            </InputGroup>
          </Stack>
        </SwitchWithRelatedSettings>
      </Stack>
    </Stack>
  )
}
