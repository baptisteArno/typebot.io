import { TextInput } from '@/components/inputs'
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
import { GoogleAnalyticsOptions } from '@typebot.io/schemas'
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
      <TextInput
        label="Tracking ID:"
        defaultValue={options?.trackingId ?? ''}
        placeholder="G-123456..."
        onChange={handleTrackingIdChange}
      />
      <TextInput
        label="Event category:"
        defaultValue={options?.category ?? ''}
        placeholder="Example: Typebot"
        onChange={handleCategoryChange}
      />
      <TextInput
        label="Event action:"
        defaultValue={options?.action ?? ''}
        placeholder="Example: Submit email"
        onChange={handleActionChange}
      />
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
            <TextInput
              label={
                <>
                  Event label <Tag>Optional</Tag>:
                </>
              }
              defaultValue={options?.label ?? ''}
              placeholder="Example: Campaign Z"
              onChange={handleLabelChange}
            />
            <TextInput
              label={
                <>
                  <FormLabel mb="0" htmlFor="value">
                    Event value <Tag>Optional</Tag>:
                  </FormLabel>
                </>
              }
              defaultValue={options?.value?.toString() ?? ''}
              placeholder="Example: 0"
              onChange={handleValueChange}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
