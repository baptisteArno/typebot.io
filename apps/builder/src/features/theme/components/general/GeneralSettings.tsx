import {
  Flex,
  FormLabel,
  Stack,
  Switch,
  useDisclosure,
  Text,
} from '@chakra-ui/react'
import { Background, Font, ProgressBar, Theme } from '@typebot.io/schemas'
import React from 'react'
import { BackgroundSelector } from './BackgroundSelector'
import { LockTag } from '@/features/billing/components/LockTag'
import { Plan } from '@typebot.io/prisma'
import { isFreePlan } from '@/features/billing/helpers/isFreePlan'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { ChangePlanModal } from '@/features/billing/components/ChangePlanModal'
import { useTranslate } from '@tolgee/react'
import {
  defaultTheme,
  fontTypes,
} from '@typebot.io/schemas/features/typebot/theme/constants'
import { trpc } from '@/lib/trpc'
import { env } from '@typebot.io/env'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { RadioButtons } from '@/components/inputs/RadioButtons'
import { FontForm } from './FontForm'
import { ProgressBarForm } from './ProgressBarForm'

type Props = {
  isBrandingEnabled: boolean
  generalTheme: Theme['general']
  onGeneralThemeChange: (general: Theme['general']) => void
  onBrandingChange: (isBrandingEnabled: boolean) => void
}

export const GeneralSettings = ({
  isBrandingEnabled,
  generalTheme,
  onGeneralThemeChange,
  onBrandingChange,
}: Props) => {
  const { t } = useTranslate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { workspace } = useWorkspace()
  const { typebot } = useTypebot()
  const isWorkspaceFreePlan = isFreePlan(workspace)

  const { mutate: trackClientEvents } =
    trpc.telemetry.trackClientEvents.useMutation()

  const updateFont = (font: Font) =>
    onGeneralThemeChange({ ...generalTheme, font })

  const updateFontType = (type: (typeof fontTypes)[number]) => {
    onGeneralThemeChange({
      ...generalTheme,
      font:
        typeof generalTheme?.font === 'string'
          ? { type }
          : { ...generalTheme?.font, type },
    })
  }

  const handleBackgroundChange = (background: Background) =>
    onGeneralThemeChange({ ...generalTheme, background })

  const updateProgressBar = (progressBar: ProgressBar) =>
    onGeneralThemeChange({ ...generalTheme, progressBar })

  const updateBranding = () => {
    if (isBrandingEnabled && isWorkspaceFreePlan) return
    if (
      env.NEXT_PUBLIC_POSTHOG_KEY &&
      typebot &&
      workspace &&
      isBrandingEnabled
    ) {
      trackClientEvents({
        events: [
          {
            name: 'Branding removed',
            typebotId: typebot.id,
            workspaceId: workspace.id,
          },
        ],
      })
    }
    onBrandingChange(!isBrandingEnabled)
  }

  const fontType =
    (typeof generalTheme?.font === 'string'
      ? 'Google'
      : generalTheme?.font?.type) ?? defaultTheme.general.font.type

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
        <FormLabel htmlFor="branding" mb="0" cursor="pointer">
          {t('theme.sideMenu.global.typebotBrand')}{' '}
          {isWorkspaceFreePlan && <LockTag plan={Plan.STARTER} />}
        </FormLabel>
        <Switch
          id="branding"
          isChecked={isBrandingEnabled}
          onChange={updateBranding}
        />
      </Flex>
      <ProgressBarForm
        progressBar={generalTheme?.progressBar}
        onProgressBarChange={updateProgressBar}
      />
      <Stack>
        <Text>{t('theme.sideMenu.global.font')}</Text>
        <RadioButtons
          options={fontTypes}
          defaultValue={fontType}
          onSelect={updateFontType}
        />
        <FontForm font={generalTheme?.font} onFontChange={updateFont} />
      </Stack>
      <BackgroundSelector
        background={generalTheme?.background}
        onBackgroundChange={handleBackgroundChange}
      />
    </Stack>
  )
}
