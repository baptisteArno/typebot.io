import { PopoverContent, PopoverArrow, PopoverBody } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { Step, StepType, TextInputOptions } from 'models'
import { TextInputSettingsBody } from './TextInputSettingsBody'

type Props = {
  step: Step
}
export const SettingsPopoverContent = ({ step }: Props) => {
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <PopoverContent onMouseDown={handleMouseDown}>
      <PopoverArrow />
      <PopoverBody p="6">
        <SettingsPopoverBodyContent step={step} />
      </PopoverBody>
    </PopoverContent>
  )
}

const SettingsPopoverBodyContent = ({ step }: Props) => {
  const { updateStep } = useTypebot()
  const handleOptionsChange = (options: TextInputOptions) =>
    updateStep(step.id, { options } as Partial<Step>)

  switch (step.type) {
    case StepType.TEXT_INPUT: {
      return (
        <TextInputSettingsBody
          options={step.options}
          onOptionsChange={handleOptionsChange}
        />
      )
    }
    default: {
      return <></>
    }
  }
}
