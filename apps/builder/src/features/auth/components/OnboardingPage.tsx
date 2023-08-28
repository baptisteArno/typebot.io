import { ChevronLastIcon } from '@/components/icons'
import {
  Button,
  Flex,
  HStack,
  StackProps,
  VStack,
  chakra,
  useColorModeValue,
} from '@chakra-ui/react'
import { Standard } from '@typebot.io/nextjs'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useUser } from '@/features/account/hooks/useUser'
import { useI18n } from '@/locales'
import { env } from '@typebot.io/env'

const totalSteps = 5

export const OnboardingPage = () => {
  const t = useI18n()
  const { push, replace } = useRouter()
  const confettiCanvaContainer = useRef<HTMLCanvasElement | null>(null)
  const confettiCanon = useRef<confetti.CreateTypes>()
  const { user, updateUser } = useUser()
  const [currentStep, setCurrentStep] = useState<number>(user?.name ? 2 : 1)

  const isNewUser =
    user &&
    new Date(user.createdAt as unknown as string).toDateString() ===
      new Date().toDateString()

  useEffect(() => {
    initConfettis()
  })

  useEffect(() => {
    if (!user?.createdAt) return
    if (isNewUser === false || !env.NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID)
      replace('/typebots')
  }, [isNewUser, replace, user?.createdAt])

  const initConfettis = () => {
    if (!confettiCanvaContainer.current || confettiCanon.current) return
    confettiCanon.current = confetti.create(confettiCanvaContainer.current, {
      resize: true,
      useWorker: true,
    })
  }

  const updateUserInfo = async (answer: {
    message: string
    blockId: string
  }) => {
    const isOtherItem = [
      'cl126pv7n001o2e6dajltc4qz',
      'saw904bfzgspmt0l24achtiy',
    ].includes(answer.blockId)
    if (isOtherItem) return
    const isName = answer.blockId === 'cl126820m000g2e6dfleq78bt'
    const isCompany = answer.blockId === 'cl126jioz000v2e6dwrk1f2cb'
    const isCategories = answer.blockId === 'cl126lb8v00142e6duv5qe08l'
    if (isName) updateUser({ name: answer.message })
    if (isCategories) {
      const onboardingCategories = answer.message.split(', ')
      updateUser({ onboardingCategories })
    }
    if (isCompany) {
      updateUser({ company: answer.message })
      if (confettiCanon.current) shootConfettis(confettiCanon.current)
    }
    setCurrentStep((prev) => prev + 1)
  }

  if (!isNewUser) return null
  return (
    <VStack h="100vh" flexDir="column" justifyContent="center" spacing="10">
      <Button
        rightIcon={<ChevronLastIcon />}
        pos="fixed"
        top="5"
        right="5"
        variant="ghost"
        size="sm"
        onClick={() => push('/typebots')}
      >
        {t('skip')}
      </Button>
      <Dots currentStep={currentStep} pos="fixed" top="9" />
      <Flex w="full" maxW="800px" h="full" maxH="70vh" rounded="lg">
        <Standard
          typebot={env.NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID}
          style={{ borderRadius: '1rem' }}
          prefilledVariables={{ Name: user?.name, Email: user?.email }}
          onEnd={() => {
            setTimeout(() => {
              push('/typebots/create', { query: { isFirstBot: true } })
            }, 2000)
          }}
          onAnswer={updateUserInfo}
        />
      </Flex>
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
    </VStack>
  )
}

const Dots = ({
  currentStep,
  ...props
}: { currentStep: number } & StackProps) => {
  const highlightedBgColor = useColorModeValue('gray.500', 'gray.100')
  const baseBgColor = useColorModeValue('gray.200', 'gray.700')
  return (
    <HStack spacing="10" {...props}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <chakra.div
          key={index}
          boxSize={'2'}
          bgColor={currentStep === index + 1 ? highlightedBgColor : baseBgColor}
          rounded="full"
          transition="background-color 0.2s ease"
        />
      ))}
    </HStack>
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
