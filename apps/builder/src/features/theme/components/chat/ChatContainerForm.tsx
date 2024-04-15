import { FormLabel, HStack, Stack } from '@chakra-ui/react'
import { ChatTheme, GeneralTheme } from '@typebot.io/schemas'
import React from 'react'
import {
  defaultBlur,
  defaultContainerBackgroundColor,
  defaultContainerMaxHeight,
  defaultContainerMaxWidth,
  defaultDarkTextColor,
  defaultLightTextColor,
  defaultOpacity,
  defaultRoundness,
} from '@typebot.io/schemas/features/typebot/theme/constants'
import { ContainerThemeForm } from './ContainerThemeForm'
import { NumberInput } from '@/components/inputs'
import { DropdownList } from '@/components/DropdownList'
import { isChatContainerLight } from '@typebot.io/theme/isChatContainerLight'

type Props = {
  generalBackground: GeneralTheme['background']
  container: ChatTheme['container']
  onContainerChange: (container: ChatTheme['container'] | undefined) => void
}

export const ChatContainerForm = ({
  generalBackground,
  container,
  onContainerChange,
}: Props) => {
  const updateMaxWidth = (maxWidth?: number) =>
    updateDimension('maxWidth', maxWidth, maxWidthUnit)

  const updateMaxWidthUnit = (unit: string) =>
    updateDimension('maxWidth', maxWidth, unit)

  const updateMaxHeight = (maxHeight?: number) =>
    updateDimension('maxHeight', maxHeight, maxHeightUnit)

  const updateMaxHeightUnit = (unit: string) =>
    updateDimension('maxHeight', maxHeight, unit)

  const updateDimension = (
    dimension: 'maxWidth' | 'maxHeight',
    value: number | undefined,
    unit: string
  ) =>
    onContainerChange({
      ...container,
      [dimension]: `${value}${unit}`,
    })

  const { value: maxWidth, unit: maxWidthUnit } = parseValueAndUnit(
    container?.maxWidth ?? defaultContainerMaxWidth
  )

  const { value: maxHeight, unit: maxHeightUnit } = parseValueAndUnit(
    container?.maxHeight ?? defaultContainerMaxHeight
  )

  return (
    <Stack>
      <HStack justifyContent="space-between">
        <FormLabel mb="0" mr="0">
          Max width:
        </FormLabel>
        <HStack>
          <NumberInput
            size="sm"
            width="100px"
            defaultValue={maxWidth}
            min={0}
            step={10}
            withVariableButton={false}
            onValueChange={updateMaxWidth}
          />
          <DropdownList
            size="sm"
            items={['px', '%', 'vh', 'vw']}
            currentItem={maxWidthUnit}
            onItemSelect={updateMaxWidthUnit}
          />
        </HStack>
      </HStack>

      <HStack justifyContent="space-between">
        <FormLabel mb="0" mr="0">
          Max height:
        </FormLabel>
        <HStack>
          <NumberInput
            size="sm"
            width="100px"
            defaultValue={maxHeight}
            min={0}
            step={10}
            onValueChange={updateMaxHeight}
            withVariableButton={false}
          />
          <DropdownList
            size="sm"
            items={['px', '%', 'vh', 'vw']}
            currentItem={maxHeightUnit}
            onItemSelect={updateMaxHeightUnit}
          />
        </HStack>
      </HStack>

      <ContainerThemeForm
        theme={container}
        defaultTheme={{
          backgroundColor: defaultContainerBackgroundColor,
          border: {
            roundeness: defaultRoundness,
          },
          blur: defaultBlur,
          opacity: defaultOpacity,
          color: isChatContainerLight({
            chatContainer: container,
            generalBackground,
          })
            ? defaultLightTextColor
            : defaultDarkTextColor,
        }}
        onThemeChange={onContainerChange}
      />
    </Stack>
  )
}

const parseValueAndUnit = (valueWithUnit: string) => {
  const value = parseFloat(valueWithUnit)
  const unit = valueWithUnit.replace(value.toString(), '')
  return { value, unit }
}
