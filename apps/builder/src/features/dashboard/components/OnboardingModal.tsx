import { chakra, useColorModeValue } from '@chakra-ui/react'
import { Popup } from '@typebot.io/react'
import { useUser } from '@/features/account/hooks/useUser'
import { Typebot } from '@typebot.io/schemas'
import React, { useEffect, useRef, useState } from 'react'
import { sendRequest } from '@typebot.io/lib'
import confetti from 'canvas-confetti'
import { useToast } from '@/hooks/useToast'
import { useRouter } from 'next/router'

type Props = { totalTypebots: number }

export const OnboardingModal = ({ totalTypebots }: Props) => {
  const { push } = useRouter()
  const botPath = useColorModeValue(
    '/bots/onboarding.json',
    '/bots/onboarding-dark.json'
  )
  const backgroundColor = useColorModeValue('white', '#171923')
  const { user, updateUser } = useUser()
  const [typebot, setTypebot] = useState<Typebot>()
  const confettiCanvaContainer = useRef<HTMLCanvasElement | null>(null)
  const confettiCanon = useRef<confetti.CreateTypes>()
  const [chosenCategories, setChosenCategories] = useState<string[]>([])

  const { showToast } = useToast()

  const isNewUser =
    user &&
    new Date(user?.createdAt as unknown as string).toDateString() ===
      new Date().toDateString() &&
    totalTypebots === 0

  useEffect(() => {
    const fetchTemplate = async () => {
      const { data, error } = await sendRequest(botPath)
      if (error)
        return showToast({ title: error.name, description: error.message })
      setTypebot(data as Typebot)
    }

    fetchTemplate()
  }, [botPath, showToast])

  useEffect(() => {
    initConfettis()
  }, [])

  const initConfettis = () => {
    if (!confettiCanvaContainer.current || confettiCanon.current) return
    confettiCanon.current = confetti.create(confettiCanvaContainer.current, {
      resize: true,
      useWorker: true,
    })
  }

  const handleBotEnd = () => {
    setTimeout(() => {
      push('/typebots/create', { query: { isFirstBot: true } })
    }, 2000)
  }

  const handleNewAnswer = async (answer: {
    message: string
    blockId: string
  }) => {
    const isName = answer.blockId === 'cl126820m000g2e6dfleq78bt'
    const isCompany = answer.blockId === 'cl126jioz000v2e6dwrk1f2cb'
    const isCategories = answer.blockId === 'cl126lb8v00142e6duv5qe08l'
    const isOtherCategories = answer.blockId === 'cl126pv7n001o2e6dajltc4qz'
    const answeredAllQuestions =
      isOtherCategories || (isCategories && !answer.message.includes('Other'))
    if (answeredAllQuestions && confettiCanon.current)
      shootConfettis(confettiCanon.current)
    if (isName) updateUser({ name: answer.message })
    if (isCompany) updateUser({ company: answer.message })
    if (isCategories) {
      const onboardingCategories = answer.message.split(', ')
      updateUser({ onboardingCategories })
      setChosenCategories(onboardingCategories)
    }
    if (isOtherCategories)
      updateUser({
        onboardingCategories: [...chosenCategories, answer.message],
      })
  }

  return (
    <>
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
      {typebot && (
        <Popup
          typebot={typebot}
          prefilledVariables={{
            Name: user?.name?.split(' ')[0] ?? undefined,
          }}
          theme={{
            backgroundColor,
          }}
          defaultOpen={isNewUser}
          onAnswer={handleNewAnswer}
          onEnd={handleBotEnd}
        />
      )}
    </>
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
