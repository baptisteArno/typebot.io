import { Flex, Stack, Text } from '@chakra-ui/react'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { Grid } from '@giphy/react-components'
import { GiphyLogo } from '../logos/GiphyLogo'
import React, { useState } from 'react'
import { TextInput } from '../inputs'
import { env } from '@typebot.io/env'

type GiphySearchFormProps = {
  onSubmit: (url: string) => void
}

const giphyFetch = new GiphyFetch(env.NEXT_PUBLIC_GIPHY_API_KEY ?? '')

export const GiphyPicker = ({ onSubmit }: GiphySearchFormProps) => {
  const [inputValue, setInputValue] = useState('')

  const fetchGifs = (offset: number) =>
    giphyFetch.search(inputValue, { offset, limit: 10 })

  const fetchGifsTrending = (offset: number) =>
    giphyFetch.trending({ offset, limit: 10 })

  return !env.NEXT_PUBLIC_GIPHY_API_KEY ? (
    <Text>NEXT_PUBLIC_GIPHY_API_KEY is missing in environment</Text>
  ) : (
    <Stack spacing={4} pt="2">
      <Flex align="center">
        <TextInput
          autoFocus
          placeholder="Search..."
          onChange={setInputValue}
          withVariableButton={false}
          width="full"
        />
        <GiphyLogo w="100px" />
      </Flex>
      <Flex overflowY="auto" maxH="400px">
        <Grid
          key={inputValue}
          onGifClick={(gif, e) => {
            e.preventDefault()
            onSubmit(gif.images.downsized.url)
          }}
          fetchGifs={inputValue === '' ? fetchGifsTrending : fetchGifs}
          width={475}
          columns={3}
          className="my-4"
        />
      </Flex>
    </Stack>
  )
}
