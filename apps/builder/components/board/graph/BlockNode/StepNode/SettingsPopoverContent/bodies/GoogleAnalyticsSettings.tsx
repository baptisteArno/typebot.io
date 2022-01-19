import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  FormLabel,
  Stack,
  Tag,
} from '@chakra-ui/react'
import { DebouncedInput } from 'components/shared/DebouncedInput'
import { InputWithVariableButton } from 'components/shared/InputWithVariableButton'
import { GoogleAnalyticsOptions } from 'models'
import React from 'react'

type Props = {
  options?: GoogleAnalyticsOptions
  onOptionsChange: (options: GoogleAnalyticsOptions) => void
}

export const GoogleAnalyticsSettings = ({
  options,
  onOptionsChange,
}: Props) => {
  const handleTrackingIdChange = (trackingId: string) =>
    onOptionsChange({ ...options, trackingId })

  const handleCategoryChange = (category: string) =>
    onOptionsChange({ ...options, category })

  const handleActionChange = (action: string) =>
    onOptionsChange({ ...options, action })

  const handleLabelChange = (label: string) =>
    onOptionsChange({ ...options, label })

  const handleValueChange = (value?: string) =>
    onOptionsChange({
      ...options,
      value: value ? parseFloat(value) : undefined,
    })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="tracking-id">
          Tracking ID:
        </FormLabel>
        <DebouncedInput
          id="tracking-id"
          initialValue={options?.trackingId ?? ''}
          placeholder="G-123456..."
          delay={100}
          onChange={handleTrackingIdChange}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="category">
          Event category:
        </FormLabel>
        <InputWithVariableButton
          id="category"
          initialValue={options?.category ?? ''}
          placeholder="Example: Typebot"
          delay={100}
          onChange={handleCategoryChange}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="action">
          Event action:
        </FormLabel>
        <InputWithVariableButton
          id="action"
          initialValue={options?.action ?? ''}
          placeholder="Example: Submit email"
          delay={100}
          onChange={handleActionChange}
        />
      </Stack>
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Advanced
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4} as={Stack} spacing="6">
            <Stack>
              <FormLabel mb="0" htmlFor="label">
                Event label <Tag>Optional</Tag>:
              </FormLabel>
              <InputWithVariableButton
                id="label"
                initialValue={options?.label ?? ''}
                placeholder="Example: Campaign Z"
                delay={100}
                onChange={handleLabelChange}
              />
            </Stack>
            <Stack>
              <FormLabel mb="0" htmlFor="value">
                Event value <Tag>Optional</Tag>:
              </FormLabel>
              <InputWithVariableButton
                id="value"
                initialValue={options?.value?.toString() ?? ''}
                placeholder="Example: 0"
                onChange={handleValueChange}
              />
            </Stack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
