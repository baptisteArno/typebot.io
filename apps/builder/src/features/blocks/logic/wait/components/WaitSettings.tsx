import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
} from '@chakra-ui/react'
import React from 'react'
import { TextInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { WaitBlock } from '@typebot.io/schemas'
import { defaultWaitOptions } from '@typebot.io/schemas/features/blocks/logic/wait/constants'

type Props = {
  options: WaitBlock['options']
  onOptionsChange: (options: WaitBlock['options']) => void
}

export const WaitSettings = ({ options, onOptionsChange }: Props) => {
  const handleSecondsChange = (secondsToWaitFor: string | undefined) => {
    onOptionsChange({ ...options, secondsToWaitFor })
  }

  const updateShouldPause = (shouldPause: boolean) => {
    onOptionsChange({ ...options, shouldPause })
  }

  return (
    <Stack spacing={4}>
      <TextInput
        label="Seconds to wait for:"
        defaultValue={options?.secondsToWaitFor}
        onChange={handleSecondsChange}
      />
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            Advanced
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel py="4">
            <SwitchWithLabel
              label="Pause the flow"
              moreInfoContent="When enabled, the flow is paused until the client sends another message. This is automatic on the web bot."
              initialValue={
                options?.shouldPause ?? defaultWaitOptions.shouldPause
              }
              onCheckChange={updateShouldPause}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
