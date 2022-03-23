import { BubbleStep, BubbleStepType } from 'models'
import React from 'react'
import { EmbedBubble } from './EmbedBubble'
import { ImageBubble } from './ImageBubble'
import { TextBubble } from './TextBubble'
import { VideoBubble } from './VideoBubble'

type Props = {
  step: BubbleStep
  onTransitionEnd: () => void
}

export const HostBubble = ({ step, onTransitionEnd }: Props) => {
  switch (step.type) {
    case BubbleStepType.TEXT:
      return <TextBubble step={step} onTransitionEnd={onTransitionEnd} />
    case BubbleStepType.IMAGE:
      return <ImageBubble step={step} onTransitionEnd={onTransitionEnd} />
    case BubbleStepType.VIDEO:
      return <VideoBubble step={step} onTransitionEnd={onTransitionEnd} />
    case BubbleStepType.EMBED:
      return <EmbedBubble step={step} onTransitionEnd={onTransitionEnd} />
  }
}
