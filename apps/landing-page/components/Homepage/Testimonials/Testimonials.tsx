import { chakra, Flex, Heading, Stack, VStack } from '@chakra-ui/react'
import * as React from 'react'
import joshuaPictureSrc from 'public/images/homepage/joshua.jpg'
import julienPictureSrc from 'public/images/homepage/julien.jpeg'
import nicolaiPictureSrc from 'public/images/homepage/nicolai.jpg'
import { Testimonial } from './Testimonial'

export const Testimonials = () => {
  return (
    <Flex as="section" justify="center">
      <VStack spacing={12} pt={'52'} px="4">
        <Heading textAlign={'center'} data-aos="fade">
          They&apos;ve tried, they never looked back. 💙
        </Heading>
        <Stack
          direction={{ base: 'column', xl: 'row' }}
          spacing="10"
          maxW="1200px"
        >
          <Testimonial
            name="Joshua Lim"
            role="Growth Strategist @ Socialhackrs Media"
            image={joshuaPictureSrc}
            data-aos="fade"
          >
            I upgraded my typeforms to typebots and saw a conversion rate
            increase{' '}
            <chakra.span fontWeight="bold" color="orange.300">
              from 14% to 43%
            </chakra.span>{' '}
            on my marketing campaigns. I noticed the improvement on day one.
            That was a game-changer.
          </Testimonial>
          <Testimonial
            name="Nicolai Grut"
            role="CEO @ EcommerceNotebook.com"
            image={nicolaiPictureSrc}
            data-aos="fade"
          >
            I am really loving using Typebot! So good. I have used all the top
            bots and yours is definitely the{' '}
            <chakra.span fontWeight="bold" color="orange.300">
              most user friendly
            </chakra.span>
            , and yet still so{' '}
            <chakra.span fontWeight="bold" color="orange.300">
              powerful
            </chakra.span>
            .
          </Testimonial>
          <Testimonial
            name="Julien Muratot"
            role="Growth Manager @ Hornetwork"
            image={julienPictureSrc}
            data-aos="fade"
          >
            I run Google ads all year long on our landing page that contains a
            typebot. I saw a{' '}
            <chakra.span fontWeight="bold" color="orange.300">
              2x increase
            </chakra.span>{' '}
            on our conversation rate compared to our old WordPress form.
          </Testimonial>
        </Stack>
      </VStack>
    </Flex>
  )
}
