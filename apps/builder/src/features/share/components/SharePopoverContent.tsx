import { Stack, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import React from 'react'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { CopyButton } from '@/components/CopyButton'
import { CollaborationList } from '@/features/collaboration/components/CollaborationList'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useTranslate } from '@tolgee/react'

export const SharePopoverContent = () => {
  const { t } = useTranslate()
  const { typebot, updateTypebot } = useTypebot()

  const currentUrl = `${window.location.origin}/typebots/${typebot?.id}/edit`

  const updateIsPublicShareEnabled = async (isEnabled: boolean) => {
    await updateTypebot({
      updates: {
        settings: {
          ...typebot?.settings,
          publicShare: {
            ...typebot?.settings.publicShare,
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
          initialValue={typebot?.settings.publicShare?.isEnabled ?? false}
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
