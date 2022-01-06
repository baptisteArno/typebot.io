import React, { useEffect, useState } from 'react'
import { animateScroll as scroll } from 'react-scroll'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { ChatStep } from './ChatStep'
import { AvatarSideContainer } from './AvatarSideContainer'
import { HostAvatarsContext } from '../../contexts/HostAvatarsContext'
import { Step, Table } from 'models'

type ChatBlockProps = {
  steps: Table<Step>
  onBlockEnd: (nextBlockId?: string) => void
}

export const ChatBlock = ({ steps, onBlockEnd }: ChatBlockProps) => {
  const [displayedSteps, setDisplayedSteps] = useState<Step[]>([])

  useEffect(() => {
    setDisplayedSteps([steps.byId[steps.allIds[0]]])
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
      displayedSteps.length === steps.allIds.length
    )
      return onBlockEnd(currentStep?.target?.blockId)
    const nextStep = steps.byId[displayedSteps.length]
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
