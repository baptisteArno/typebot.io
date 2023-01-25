import {
  chakra,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { TypebotViewer } from 'bot-engine'
import { useUser } from '@/features/account'
import { AnswerInput, Typebot } from 'models'
import React, { useEffect, useRef, useState } from 'react'
import { getViewerUrl, sendRequest } from 'utils'
import confetti from 'canvas-confetti'
import { useToast } from '@/hooks/useToast'
import { parseTypebotToPublicTypebot } from '@/features/publish'

type Props = { totalTypebots: number }

export const OnboardingModal = ({ totalTypebots }: Props) => {
  const botPath = useColorModeValue(
    '/bots/onboarding.json',
    '/bots/onboarding-dark.json'
  )
  const { user, updateUser } = useUser()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [typebot, setTypebot] = useState<Typebot>()
  const confettiCanvaContainer = useRef<HTMLCanvasElement | null>(null)
  const confettiCanon = useRef<confetti.CreateTypes>()
  const [chosenCategories, setChosenCategories] = useState<string[]>([])
  const [openedOnce, setOpenedOnce] = useState(false)

  const { showToast } = useToast()

  useEffect(() => {
    fetchTemplate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (openedOnce) return
    const isNewUser =
      user &&
      new Date(user?.createdAt as unknown as string).toDateString() ===
        new Date().toDateString() &&
      totalTypebots === 0
    if (isNewUser) {
      onOpen()
      setOpenedOnce(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    initConfettis()
    return () => {
      window.removeEventListener('message', handleIncomingMessage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confettiCanvaContainer.current])

  const initConfettis = () => {
    if (!confettiCanvaContainer.current || confettiCanon.current) return
    confettiCanon.current = confetti.create(confettiCanvaContainer.current, {
      resize: true,
      useWorker: true,
    })
    window.addEventListener('message', handleIncomingMessage)
  }

  const handleIncomingMessage = (message: MessageEvent) => {
    if (message.data.from === 'typebot') {
      if (message.data.action === 'shootConfettis' && confettiCanon.current)
        shootConfettis(confettiCanon.current)
    }
  }

  const fetchTemplate = async () => {
    const { data, error } = await sendRequest(botPath)
    if (error)
      return showToast({ title: error.name, description: error.message })
    setTypebot(data as Typebot)
  }

  const handleNewAnswer = async (answer: AnswerInput) => {
    const isName = answer.variableId === 'cl126f4hf000i2e6d8zvzc3t1'
    const isCompany = answer.variableId === 'cl126jqww000w2e6dq9yv4ifq'
    const isCategories = answer.variableId === 'cl126mo3t001b2e6dvyi16bkd'
    const isOtherCategories = answer.variableId === 'cl126q38p001q2e6d0hj23f6b'
    if (isName) updateUser({ name: answer.content })
    if (isCompany) updateUser({ company: answer.content })
    if (isCategories) {
      const onboardingCategories = answer.content.split(', ')
      updateUser({ onboardingCategories })
      setChosenCategories(onboardingCategories)
    }
    if (isOtherCategories)
      updateUser({
        onboardingCategories: [...chosenCategories, answer.content],
      })
  }

  return (
    <Modal
      size="3xl"
      isOpen={isOpen}
      onClose={onClose}
      blockScrollOnMount={false}
    >
      <chakra.canvas
        ref={confettiCanvaContainer}
        pos="fixed"
        top="0"
        left="0"
        w="full"
        h="full"
        zIndex={9999}
        pointerEvents="none"
      />
      <ModalOverlay />
      <ModalContent h="85vh">
        <ModalBody p="10">
          {typebot && (
            <TypebotViewer
              apiHost={getViewerUrl()}
              typebot={parseTypebotToPublicTypebot(typebot)}
              predefinedVariables={{
                Name: user?.name?.split(' ')[0] ?? undefined,
              }}
              onNewAnswer={handleNewAnswer}
              style={{ borderRadius: '0.25rem' }}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const shootConfettis = (confettiCanon: confetti.CreateTypes) => {
  const count = 200
  const defaults = {
    origin: { y: 0.7 },
  }

  const fire = (
    particleRatio: number,
    opts: {
      spread: number
      startVelocity?: number
      decay?: number
      scalar?: number
    }
  ) => {
    confettiCanon(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      })
    )
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })
  fire(0.2, {
    spread: 60,
  })
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}
