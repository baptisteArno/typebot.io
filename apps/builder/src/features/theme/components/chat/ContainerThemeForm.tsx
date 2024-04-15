import {
  Stack,
  FormLabel,
  HStack,
  Switch,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react'
import {
  ContainerTheme,
  ContainerBorderTheme,
  InputTheme,
} from '@typebot.io/schemas'
import React from 'react'
import { ColorPicker } from '../../../../components/ColorPicker'
import { useTranslate } from '@tolgee/react'
import { NumberInput } from '@/components/inputs'
import { DropdownList } from '@/components/DropdownList'
import {
  borderRoundness,
  defaultOpacity,
  shadows,
} from '@typebot.io/schemas/features/typebot/theme/constants'

type Props<T extends ((placeholder: string) => void) | undefined> = {
  theme: (T extends undefined ? ContainerTheme : InputTheme) | undefined
  defaultTheme: T extends undefined ? ContainerTheme : InputTheme
  placeholderColor?: T extends undefined ? never : string
  testId?: string
  onThemeChange: (
    theme: T extends undefined ? ContainerTheme : InputTheme
  ) => void
  onPlaceholderColorChange?: T
}

export const ContainerThemeForm = <
  T extends ((placeholder: string) => void) | undefined
>({
  theme,
  testId,
  defaultTheme,
  onPlaceholderColorChange,
  onThemeChange,
}: Props<T>) => {
  const { t } = useTranslate()

  const updateBackgroundColor = (backgroundColor: string) =>
    onThemeChange({ ...theme, backgroundColor })

  const toggleBackgroundColor = () =>
    onThemeChange({
      ...theme,
      backgroundColor:
        backgroundColor === 'transparent' ? '#ffffff' : 'transparent',
    })

  const updateTextColor = (color: string) => onThemeChange({ ...theme, color })

  const updateShadow = (shadow?: ContainerTheme['shadow']) =>
    onThemeChange({ ...theme, shadow })

  const updateBlur = (blur?: number) => onThemeChange({ ...theme, blur })

  const updateOpacity = (opacity?: number) =>
    onThemeChange({ ...theme, opacity })

  const updateBorder = (border: ContainerBorderTheme) =>
    onThemeChange({ ...theme, border })

  const updatePlaceholderColor = (color: string) =>
    onThemeChange({ ...theme, placeholderColor: color } as InputTheme)

  const backgroundColor =
    theme?.backgroundColor ?? defaultTheme?.backgroundColor

  const shadow = theme?.shadow ?? defaultTheme?.shadow ?? 'none'

  return (
    <Stack spacing={4} data-testid={testId}>
      <HStack justify="space-between">
        <FormLabel mb="0" mr="0">
          {t('theme.sideMenu.chat.theme.background')}
        </FormLabel>
        <HStack>
          <Switch
            defaultChecked={backgroundColor !== 'transparent'}
            onChange={toggleBackgroundColor}
          />
          <ColorPicker
            isDisabled={backgroundColor === 'transparent'}
            value={backgroundColor}
            onColorChange={updateBackgroundColor}
          />
        </HStack>
      </HStack>

      <HStack justify="space-between">
        <FormLabel mb="0" mr="0">
          {t('theme.sideMenu.chat.theme.text')}
        </FormLabel>
        <ColorPicker
          value={theme?.color ?? defaultTheme?.color}
          onColorChange={updateTextColor}
        />
      </HStack>
      {onPlaceholderColorChange && (
        <HStack justify="space-between">
          <FormLabel mb="0" mr="0">
            {t('theme.sideMenu.chat.theme.placeholder')}
          </FormLabel>
          <ColorPicker
            value={
              theme && 'placeholderColor' in theme
                ? theme.placeholderColor
                : defaultTheme && 'placeholderColor' in defaultTheme
                ? defaultTheme.placeholderColor
                : undefined
            }
            onColorChange={updatePlaceholderColor}
          />
        </HStack>
      )}

      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            Border
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <BorderThemeForm
              border={theme?.border}
              defaultBorder={defaultTheme.border}
              onBorderChange={updateBorder}
            />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            Advanced
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel as={Stack}>
            {backgroundColor !== 'transparent' && (
              <>
                <NumberInput
                  size="sm"
                  direction="row"
                  label="Opacity:"
                  width="100px"
                  min={0}
                  max={1}
                  step={0.1}
                  defaultValue={theme?.opacity ?? defaultTheme?.opacity}
                  onValueChange={updateOpacity}
                  withVariableButton={false}
                />
                {(theme?.opacity ?? defaultTheme?.opacity) !== 1 && (
                  <NumberInput
                    size="sm"
                    direction="row"
                    label="Blur:"
                    suffix="px"
                    width="100px"
                    min={0}
                    defaultValue={theme?.blur ?? defaultTheme?.blur}
                    onValueChange={updateBlur}
                    withVariableButton={false}
                  />
                )}
              </>
            )}
            <HStack justify="space-between">
              <FormLabel mb="0" mr="0">
                Shadow:
              </FormLabel>
              <HStack>
                <DropdownList
                  currentItem={shadow}
                  onItemSelect={updateShadow}
                  items={shadows}
                  size="sm"
                />
              </HStack>
            </HStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}

const BorderThemeForm = ({
  border,
  defaultBorder,
  onBorderChange,
}: {
  border: ContainerBorderTheme | undefined
  defaultBorder: ContainerBorderTheme | undefined
  onBorderChange: (border: ContainerBorderTheme) => void
}) => {
  const updateRoundness = (roundeness: (typeof borderRoundness)[number]) => {
    onBorderChange({ ...border, roundeness })
  }

  const updateCustomRoundeness = (customRoundeness: number | undefined) => {
    onBorderChange({ ...border, customRoundeness })
  }

  const updateThickness = (thickness: number | undefined) => {
    onBorderChange({ ...border, thickness })
  }

  const updateColor = (color: string | undefined) => {
    onBorderChange({ ...border, color })
  }

  const updateOpacity = (opacity: number | undefined) => {
    onBorderChange({ ...border, opacity })
  }

  const thickness = border?.thickness ?? defaultBorder?.thickness ?? 0

  return (
    <Stack>
      <HStack justifyContent="space-between">
        <FormLabel mb="0" mr="0">
          Roundness:
        </FormLabel>
        <HStack>
          <DropdownList
            currentItem={border?.roundeness ?? defaultBorder?.roundeness}
            onItemSelect={updateRoundness}
            items={borderRoundness}
            placeholder="md"
            size="sm"
          />
          {(border?.roundeness ?? defaultBorder?.roundeness) === 'custom' && (
            <NumberInput
              size="sm"
              suffix="px"
              width="60px"
              min={0}
              defaultValue={border?.customRoundeness}
              onValueChange={updateCustomRoundeness}
              withVariableButton={false}
            />
          )}
        </HStack>
      </HStack>

      <HStack justifyContent="space-between">
        <FormLabel mb="0" mr="0">
          Thickness:
        </FormLabel>
        <NumberInput
          size="sm"
          suffix="px"
          width="60px"
          min={0}
          defaultValue={thickness}
          onValueChange={updateThickness}
          withVariableButton={false}
        />
      </HStack>

      {thickness > 0 && (
        <>
          <HStack justifyContent="space-between">
            <FormLabel mb="0" mr="0">
              Color:
            </FormLabel>
            <ColorPicker
              value={border?.color ?? defaultBorder?.color}
              onColorChange={updateColor}
            />
          </HStack>
          <NumberInput
            size="sm"
            direction="row"
            label="Opacity:"
            width="100px"
            min={0}
            max={1}
            step={0.1}
            defaultValue={border?.opacity ?? defaultOpacity}
            onValueChange={updateOpacity}
            withVariableButton={false}
          />
        </>
      )}
    </Stack>
  )
}
