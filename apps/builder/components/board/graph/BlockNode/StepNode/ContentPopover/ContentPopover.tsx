import {
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from '@chakra-ui/react'
import { ImageUploadContent } from 'components/shared/ImageUploadContent'
import { useTypebot } from 'contexts/TypebotContext'
import {
  BubbleStep,
  BubbleStepType,
  ImageBubbleStep,
  TextBubbleStep,
  VideoBubbleContent,
  VideoBubbleStep,
} from 'models'
import { useRef } from 'react'
import { VideoUploadContent } from './VideoUploadContent'

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

  const handleContentChange = (url: string) =>
    updateStep(step.id, { content: { url } } as Partial<ImageBubbleStep>)

  const handleVideoContentChange = (content: VideoBubbleContent) =>
    updateStep(step.id, { content } as Partial<VideoBubbleStep>)

  switch (step.type) {
    case BubbleStepType.IMAGE: {
      return (
        <ImageUploadContent
          url={step.content?.url}
          onSubmit={handleContentChange}
        />
      )
    }
    case BubbleStepType.VIDEO: {
      return (
        <VideoUploadContent
          content={step.content}
          onSubmit={handleVideoContentChange}
        />
      )
    }
  }
}
