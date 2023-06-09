import {
  Button,
  DarkMode,
  Flex,
  Heading,
  Stack,
  VStack,
  Text,
  SimpleGrid,
} from '@chakra-ui/react'
import { BackgroundPolygons } from 'components/Homepage/Hero/BackgroundPolygons'
import { Footer } from 'components/common/Footer'
import { Header } from 'components/common/Header/Header'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
import Link from 'next/link'

const OSSFriends = [
  {
    name: 'Cal.com',
    description:
      'Cal.com is a scheduling tool that helps you schedule meetings without the back-and-forth emails.',
    href: 'https://cal.com',
  },
  {
    name: 'Crowd.dev',
    description:
      'Centralize community, product, and customer data to understand which companies are engaging with your open source project.',
    href: 'https://www.crowd.dev',
  },
  {
    name: 'Documenso',
    description:
      'The Open-Source DocuSign Alternative. We aim to earn your trust by enabling you to self-host the platform and examine its inner workings.',
    href: 'https://documenso.com',
  },
  {
    name: 'Erxes',
    description:
      'The Open-Source HubSpot Alternative. A single XOS enables to create unique and life-changing experiences ​​that work for all types of business.',
    href: 'https://erxes.io',
  },
  {
    name: 'Formbricks',
    description:
      'Survey granular user segments at any point in the user journey. Gather up to 6x more insights with targeted micro-surveys. All open-source.',
    href: 'https://formbricks.com',
  },
  {
    name: 'Forward Email',
    description:
      'Free email forwarding for custom domains. For 6 years and counting, we are the go-to email service for thousands of creators, developers, and businesses.',
    href: 'https://forwardemail.net',
  },
  {
    name: 'GitWonk',
    description:
      'GitWonk is an open-source technical documentation tool, designed and built focusing on the developer experience.',
    href: 'https://gitwonk.com',
  },
  {
    name: 'HTMX',
    description:
      'HTMX is a dependency-free JavaScript library that allows you to access AJAX, CSS Transitions, WebSockets, and Server Sent Events directly in HTML.',
    href: 'https://htmx.org',
  },
  {
    name: 'Infisical',
    description:
      'Open source, end-to-end encrypted platform that lets you securely manage secrets and configs across your team, devices, and infrastructure.',
    href: 'https://infisical.com',
  },
  {
    name: 'Novu',
    description:
      'The open-source notification infrastructure for developers. Simple components and APIs for managing all communication channels in one place.',
    href: 'https://novu.co',
  },
  {
    name: 'OpenBB',
    description:
      "The most innovative investment research platform. Open to anyone's input. Open to everyone's work.",
    href: 'https://openbb.co',
  },
  {
    name: 'Sniffnet',
    description:
      'Sniffnet is a network monitoring tool to help you easily keep track of your Internet traffic.',
    href: 'https://www.sniffnet.net',
  },
  {
    name: 'Webiny',
    description:
      'Open-source enterprise-grade serverless CMS. Own your data. Scale effortlessly. Customize everything.',
    href: 'https://www.webiny.com',
  },
  {
    name: 'BoxyHQ',
    description:
      'BoxyHQ’s suite of APIs for security and privacy helps engineering teams build and ship compliant cloud applications faster.',
    href: 'https://boxyhq.com',
  },
  {
    name: 'Webstudio',
    description: 'Webstudio is an open source alternative to Webflow',
    href: 'https://webstudio.is',
  },
]

export default function OSSFriendsPage() {
  return (
    <Stack overflowX="hidden" bgColor="gray.900">
      <Flex
        pos="relative"
        flexDir="column"
        minHeight="100vh"
        alignItems="center"
        bgGradient="linear(to-b, gray.900, gray.800)"
        pb={40}
      >
        <SocialMetaTags currentUrl={`https://www.typebot.io/oss-friends`} />
        <BackgroundPolygons />
        <DarkMode>
          <Header />
        </DarkMode>
        <VStack spacing={12}>
          <Stack pt="20" px="2" spacing="4">
            <Heading fontSize={{ base: '4xl', xl: '6xl' }} textAlign="center">
              Our{' '}
              <Text as="span" color="blue.200" fontWeight="bold">
                Open-source
              </Text>{' '}
              Friends
            </Heading>
            <Text
              maxW="900px"
              textAlign="center"
              fontSize={{ base: 'lg', xl: 'xl' }}
            >
              We love open-source and we are proud to support these amazing
              projects. 💙
            </Text>
          </Stack>

          <SimpleGrid columns={[1, 2, 3]} spacing="6" maxW="1200px">
            {OSSFriends.map((friend, index) => (
              <Stack
                key={index}
                p="6"
                rounded="lg"
                bgColor="gray.800"
                color="white"
                shadow="lg"
                spacing="4"
                data-aos="fade"
                justifyContent="space-between"
              >
                <Stack spacing={4}>
                  <Heading fontSize="2xl">{friend.name}</Heading>
                  <Text>{friend.description}</Text>
                </Stack>

                <Flex>
                  <Button
                    as={Link}
                    target="_blank"
                    href={friend.href}
                    variant="outline"
                  >
                    Learn more
                  </Button>
                </Flex>
              </Stack>
            ))}
          </SimpleGrid>
        </VStack>
      </Flex>
      <Footer />
    </Stack>
  )
}
