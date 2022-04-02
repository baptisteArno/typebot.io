import { Box, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import * as React from 'react'
import Image, { StaticImageData } from 'next/image'
import { QuoteLeftIcon } from 'assets/icons/QuoteLeftIcon'

interface TestimonialProps {
  image: StaticImageData
  name: string
  role: string
  children: React.ReactNode
}

export const Testimonial = (props: TestimonialProps) => {
  const { image, name, role, children } = props
  return (
    <Flex
      flexDir="column"
      justify="space-between"
      as="blockquote"
      p="6"
      rounded="lg"
      bgColor="gray.800"
      color="white"
      shadow="lg"
      {...props}
    >
      <Stack>
        <QuoteLeftIcon boxSize="25px" />
        <Text mt="3" fontSize="xl" maxW="38rem" color="gray.400">
          {children}
        </Text>
      </Stack>

      <HStack mt="6" spacing="4">
        <Image
          src={image}
          alt={name}
          placeholder="blur"
          width="80px"
          height="80px"
          className="rounded-full"
        />
        <Box>
          <Text
            as="cite"
            fontStyle="normal"
            fontWeight="extrabold"
            color="white"
          >
            {name}
          </Text>
          <Text fontSize="sm" color={'gray.100'}>
            {role}
          </Text>
        </Box>
      </HStack>
    </Flex>
  )
}
