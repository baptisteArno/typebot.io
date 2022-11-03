import { Flex, Stack, Heading, Text, Button, VStack } from '@chakra-ui/react'
import { ArrowRight } from 'assets/icons/ArrowRight'
import { TypebotViewer } from 'bot-engine'
import { PublicTypebot, Typebot } from 'models'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { sendRequest } from 'utils'

export const RealTimeResults = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [typebot, setTypebot] = useState<PublicTypebot>()

  const fetchTemplate = async () => {
    const { data, error } = await sendRequest(
      `/typebots/realtime-airtable.json`
    )
    if (error) return
    const typebot = data as Typebot
    setTypebot({ ...typebot, typebotId: typebot.id } as PublicTypebot)
  }

  useEffect(() => {
    fetchTemplate()
    window.addEventListener('message', processMessage)
    const interval = setInterval(refreshIframeContent, 30000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('message', processMessage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const processMessage = (event: MessageEvent) => {
    if (event.data.from === 'typebot') refreshIframeContent()
  }

  const refreshIframeContent = () => {
    if (!iframeRef.current) return
    iframeRef.current.src += ''
  }

  return (
    <Flex as="section" justify="center">
      <Stack
        style={{ maxWidth: '1200px' }}
        pt={'52'}
        w="full"
        px="4"
        spacing={16}
        justifyContent="space-between"
        alignItems="center"
      >
        <VStack spacing={6}>
          <Heading
            fontSize={{ base: '4xl', xl: '6xl' }}
            textAlign="center"
            data-aos="fade"
          >
            Collect results in real-time
          </Heading>
          <Text
            textAlign="center"
            color="gray.400"
            maxW="1000px"
            fontSize={{ base: 'lg', xl: 'xl' }}
            data-aos="fade"
          >
            One of the main advantage of a chat application is that you collect
            the user's responses on each question.{' '}
            <strong>You won't loose any valuable data.</strong>
          </Text>
          <Flex>
            <Button
              as={Link}
              rightIcon={<ArrowRight />}
              href={`https://app.typebot.io/register`}
              variant="ghost"
              colorScheme="blue"
              data-aos="fade"
            >
              Try it now
            </Button>
          </Flex>
        </VStack>

        <Stack
          w="full"
          direction={['column', 'row']}
          spacing="4"
          data-aos="fade"
        >
          {typebot && (
            <Flex w="full" h="full" minH="300" borderWidth="1px" rounded="md">
              <TypebotViewer
                typebot={typebot}
                style={{ borderRadius: '0.375rem' }}
                apiHost="https://typebot.io"
              />
            </Flex>
          )}
          <iframe
            ref={iframeRef}
            src="https://airtable.com/embed/shr8nkV6DVN88LVIv?backgroundColor=blue"
            width="100%"
            height="533"
            style={{
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: 'white',
            }}
          />
        </Stack>
      </Stack>
    </Flex>
  )
}
