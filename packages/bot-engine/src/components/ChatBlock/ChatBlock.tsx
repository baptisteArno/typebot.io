import React, { useEffect, useState } from 'react'
import { Block, Step } from '../../models'
import { animateScroll as scroll } from 'react-scroll'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { ChatStep } from './ChatStep'
import { AvatarSideContainer } from './AvatarSideContainer'
import { HostAvatarsContext } from '../../contexts/HostAvatarsContext'

type ChatBlockProps = {
  block: Block
  onBlockEnd: (nextBlockId?: string) => void
}

export const ChatBlock = ({ block, onBlockEnd }: ChatBlockProps) => {
  const [displayedSteps, setDisplayedSteps] = useState<Step[]>([])

  useEffect(() => {
    setDisplayedSteps([block.steps[0]])
  }, [])

  useEffect(() => {
    autoScrollToBottom()
  }, [displayedSteps])

  const autoScrollToBottom = () => {
    scroll.scrollToBottom({
      duration: 500,
      containerId: 'scrollable-container',
    })
  }

  const displayNextStep = () => {
    const currentStep = [...displayedSteps].pop()
    if (
      currentStep?.target?.blockId ||
      displayedSteps.length === block.steps.length
    )
      return onBlockEnd(currentStep?.target?.blockId)
    const nextStep = block.steps[displayedSteps.length]
    if (nextStep) setDisplayedSteps([...displayedSteps, nextStep])
  }

  return (
    <div className="flex">
      <HostAvatarsContext>
        <AvatarSideContainer />
        <div className="flex flex-col w-full">
          <TransitionGroup>
            {displayedSteps.map((step) => (
              <CSSTransition
                key={step.id}
                classNames="bubble"
                timeout={500}
                unmountOnExit
              >
                <ChatStep step={step} onTransitionEnd={displayNextStep} />
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
      </HostAvatarsContext>
    </div>
  )
}
