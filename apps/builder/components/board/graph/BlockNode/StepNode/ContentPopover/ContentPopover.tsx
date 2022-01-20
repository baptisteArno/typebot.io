import {
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from '@chakra-ui/react'
import { ImagePopoverContent } from 'components/shared/ImageUploadContent'
import { useTypebot } from 'contexts/TypebotContext'
import {
  BubbleStep,
  BubbleStepType,
  ImageBubbleContent,
  ImageBubbleStep,
  TextBubbleStep,
} from 'models'
import { useRef } from 'react'

type Props = {
  step: Exclude<BubbleStep, TextBubbleStep>
}

export const ContentPopover = ({ step }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <Portal>
      <PopoverContent onMouseDown={handleMouseDown} w="500px">
        <PopoverArrow />
        <PopoverBody ref={ref} shadow="lg">
          <StepContent step={step} />
        </PopoverBody>
      </PopoverContent>
    </Portal>
  )
}

export const StepContent = ({ step }: Props) => {
  const { updateStep } = useTypebot()
  const handleContentChange = (content: ImageBubbleContent) =>
    updateStep(step.id, { content } as Partial<ImageBubbleStep>)

  const handleNewImageSubmit = (url: string) => handleContentChange({ url })
  switch (step.type) {
    case BubbleStepType.IMAGE: {
      return (
        <ImagePopoverContent
          url={step.content?.url}
          onSubmit={handleNewImageSubmit}
        />
      )
    }
  }
}
