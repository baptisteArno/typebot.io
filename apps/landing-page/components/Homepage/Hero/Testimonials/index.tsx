import { chakra, Stack } from '@chakra-ui/react'
import * as React from 'react'
import joshuaPictureSrc from 'public/images/homepage/joshua.jpg'
import julienPictureSrc from 'public/images/homepage/julien.jpg'
import { Testimonial } from './Testimonial'

export const Testimonials = () => {
  return (
    <Stack direction={['column', 'row']} spacing="10" maxW="800px">
      <Testimonial
        name="Joshua Lim"
        role="Growth Strategist @ Socialhackrs Media"
        image={joshuaPictureSrc}
      >
        I upgraded my typeforms to typebots and saw a conversion rate increase{' '}
        <chakra.span fontWeight="bold" color="orange.300">
          from 14% to 43%
        </chakra.span>{' '}
        on my marketing campaigns. I noticed the improvement on day one. That
        was a game-changer.
      </Testimonial>
      <Testimonial
        name="Julien Muratot"
        role="Growth Manager @ Hornetwork"
        image={julienPictureSrc}
      >
        I run Google ads all year long on our landing page that contains a
        typebot. I saw a{' '}
        <chakra.span fontWeight="bold" color="orange.300">
          2x increase
        </chakra.span>{' '}
        on our conversation rate compared to our old WordPress form.
      </Testimonial>
    </Stack>
  )
}
