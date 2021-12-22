import React, { useEffect, useRef, useState } from 'react'
import { useTypebot } from '../../contexts/TypebotContext'
import { HostAvatar } from '../avatars/HostAvatar'
import { useFrame } from 'react-frame-component'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { useHostAvatars } from '../../contexts/HostAvatarsContext'

export const AvatarSideContainer = () => {
  const { lastBubblesTopOffset } = useHostAvatars()
  const { typebot } = useTypebot()
  const { window, document } = useFrame()
  const [marginBottom, setMarginBottom] = useState(
    window.innerWidth < 400 ? 38 : 48
  )

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const isMobile = window.innerWidth < 400
      setMarginBottom(isMobile ? 38 : 48)
    })
    resizeObserver.observe(document.body)
  }, [])

  return (
    <div className="flex w-6 xs:w-10 mr-2 flex-shrink-0 items-center">
      <TransitionGroup>
        {lastBubblesTopOffset
          .filter((n) => n !== -1)
          .map((topOffset, idx) => (
            <CSSTransition
              key={idx}
              classNames="bubble"
              timeout={500}
              unmountOnExit
            >
              <div
                className="fixed w-6 h-6 xs:w-10 xs:h-10 mb-4 xs:mb-2 flex items-center top-0"
                style={{
                  top: `calc(${topOffset}px - ${marginBottom}px)`,
                  transition: 'top 500ms ease-out',
                }}
              >
                <HostAvatar typebotName={typebot.name} />
              </div>
            </CSSTransition>
          ))}
      </TransitionGroup>
    </div>
  )
}
