import { Stack, Text, Box, Flex, Heading } from '@chakra-ui/react'
import { Header } from 'components/common/Header/Header'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import React from 'react'
import selfie from '../public/images/about/selfie.png'
import Image from 'next/image'
import { Footer } from 'components/common/Footer'
import { TextLink } from 'components/common/TextLink'

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden ">
      <Header />
      <SocialMetaTags currentUrl={`https://www.typebot.io/about`} />
      <Stack
        spacing={10}
        mx="auto"
        maxW="3xl"
        my="20"
        fontSize="17px"
        textAlign="justify"
      >
        <Flex w="full">
          <Heading as="h1">Typebot&apos;s story</Heading>
        </Flex>

        <Text>
          Typebot&apos;s team is composed of only me, Baptiste Arnaud, a
          Software Engineer based in France.
        </Text>
        <Flex w="full" justify="center">
          <Box as="figure" maxW="200px">
            <Image src={selfie} alt="selfie" />
          </Box>
        </Flex>

        <Text>
          I&apos;m passionate about great product UX and, during the first COVID
          lockdown, I decided to create my own Typeform alternative.
        </Text>

        <Text>
          Typebot was launched in July 2020. It is completely independent,
          self-funded, and bootstrapped. At the current stage, I&apos;m not
          interested in raising funds or taking investments.
        </Text>
        <Text>
          Because I love open-source SaaS, I decided in early 2022, alongside
          the launch of a major 2.0 release, to open-source the project
          entirely. Anyone can now read the source code and contribute to the
          project. You can also self-host your own version of Typebot on your
          server.
        </Text>
        <Text>
          With Typebot, I want to create the best bot-building experience. My
          goal is to empower you as a user and help you build great user
          experiences. Also, privacy comes first. While using Typebot, you
          aren&apos;t tracked by some third-party analytics tool.
        </Text>
        <Text>
          I&apos;m working hard on making a living from Typebot with a simple
          business model: <br />
          <br /> You can use the tool for free but your forms will contain a
          &quot;Made with Typebot&quot; small badge that potentially gets people
          to know about the product. If you want to remove it and also have
          access to other advanced features, you have to subscribe for $39 per
          month.
        </Text>
        <Text>
          If you have any questions, feel free to reach out to me at{' '}
          <TextLink href={'mailto:baptiste@typebot.io'}>
            baptiste@typebot.io
          </TextLink>
        </Text>
      </Stack>
      <Footer />
    </div>
  )
}

export default AboutPage
