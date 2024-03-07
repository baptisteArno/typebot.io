import { ColorPicker } from '@/components/ColorPicker'
import { DropdownList } from '@/components/DropdownList'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { NumberInput } from '@/components/inputs'
import { FormLabel, HStack } from '@chakra-ui/react'
import { ProgressBar } from '@typebot.io/schemas'
import {
  defaultTheme,
  progressBarPlacements,
  progressBarPositions,
} from '@typebot.io/schemas/features/typebot/theme/constants'

type Props = {
  progressBar: ProgressBar | undefined
  onProgressBarChange: (progressBar: ProgressBar) => void
}

export const ProgressBarForm = ({
  progressBar,
  onProgressBarChange,
}: Props) => {
  const updateEnabled = (isEnabled: boolean) =>
    onProgressBarChange({ ...progressBar, isEnabled })

  const updateColor = (color: string) =>
    onProgressBarChange({ ...progressBar, color })

  const updatePlacement = (placement: (typeof progressBarPlacements)[number]) =>
    onProgressBarChange({ ...progressBar, placement })

  const updatePosition = (position: (typeof progressBarPositions)[number]) =>
    onProgressBarChange({ ...progressBar, position })

  const updateThickness = (thickness?: number) =>
    onProgressBarChange({ ...progressBar, thickness })

  return (
    <SwitchWithRelatedSettings
      label={'Enable progress bar?'}
      initialValue={
        progressBar?.isEnabled ?? defaultTheme.general.progressBar.isEnabled
      }
      onCheckChange={updateEnabled}
    >
      <DropdownList
        size="sm"
        direction="row"
        label="Placement:"
        currentItem={
          progressBar?.placement ?? defaultTheme.general.progressBar.placement
        }
        onItemSelect={updatePlacement}
        items={progressBarPlacements}
      />

      <HStack justifyContent="space-between">
        <FormLabel mb="0" mr="0">
          Color:
        </FormLabel>
        <ColorPicker
          defaultValue={
            progressBar?.color ?? defaultTheme.general.progressBar.color
          }
          onColorChange={updateColor}
        />
      </HStack>
      <NumberInput
        label="Thickness:"
        direction="row"
        withVariableButton={false}
        maxW="100px"
        defaultValue={
          progressBar?.thickness ?? defaultTheme.general.progressBar.thickness
        }
        onValueChange={updateThickness}
        size="sm"
      />
      <DropdownList
        size="sm"
        direction="row"
        label="Position when embedded:"
        moreInfoTooltip='Select "fixed" to always position the progress bar at the top of the window even though your bot is embedded. Select "absolute" to position the progress bar at the top of the chat container.'
        currentItem={
          progressBar?.position ?? defaultTheme.general.progressBar.position
        }
        onItemSelect={updatePosition}
        items={progressBarPositions}
      />
    </SwitchWithRelatedSettings>
  )
}
