import { Flex, Heading, SimpleGrid, Stack, VStack } from '@chakra-ui/react'
import * as React from 'react'
// import joshuaPictureSrc from 'public/images/joshua.jpg'

import { Testimonial } from './Testimonial'
import { StaticImageData } from 'next/image'

export type TestimonialData = {
  name: string
  avatarSrc?: StaticImageData
  provider: 'email' | 'productHunt' | 'capterra' | 'reddit'
  role?: string
  content: string | React.ReactNode
}

const testimonials: TestimonialData[][] = [
  [
    // {
    //   name: 'Joshua Lim',
    //   role: 'Growth Strategist @ Socialhackrs Media',
    //   avatarSrc: joshuaPictureSrc,
    //   provider: 'email',
    //   content:
    //     'I upgraded my typeforms to typebots and saw a conversion rate increase from 14% to 43% on my marketing campaigns. I noticed the improvement on day one. That was a game-changer.',
    // },
  ],
]

export const Testimonials = () => {
  return (
    <Flex as="section" justify="center">
      <VStack spacing={12} pt={'52'} px="4" maxW="1400px">
        <Heading textAlign={'center'} data-aos="fade">
          They&apos;ve tried, they never looked back. 💙
        </Heading>
        <SimpleGrid columns={[1, 2, 3]} spacing="6">
          {testimonials.map((testimonialGroup, index) => (
            <Stack key={index} spacing="6">
              {testimonialGroup.map((testimonial, index) => (
                <Testimonial key={index} {...testimonial} />
              ))}
            </Stack>
          ))}
        </SimpleGrid>
      </VStack>
    </Flex>
  )
}
