import { Flex, Stack, Text } from '@chakra-ui/react'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { Grid } from '@giphy/react-components'
import { GiphyLogo } from 'assets/logos'
import React, { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { env, isEmpty } from 'utils'
import { Input } from '../Textbox'

type GiphySearchFormProps = {
  onSubmit: (url: string) => void
}

const giphyFetch = new GiphyFetch(env('GIPHY_API_KEY') as string)

export const GiphySearchForm = ({ onSubmit }: GiphySearchFormProps) => {
  const [inputValue, setInputValue] = useState('')
  const [debouncedInputValue] = useDebounce(inputValue, 500)

  const fetchGifs = (offset: number) =>
    giphyFetch.search(inputValue, { offset, limit: 10 })

  const fetchGifsTrending = (offset: number) =>
    giphyFetch.trending({ offset, limit: 10 })

  return isEmpty(env('GIPHY_API_KEY')) ? (
    <Text>NEXT_PUBLIC_GIPHY_API_KEY is missing in environment</Text>
  ) : (
    <Stack>
      <Flex align="center">
        <Input
          flex="1"
          autoFocus
          placeholder="Search..."
          onChange={setInputValue}
          value={inputValue}
          withVariableButton={false}
        />
        <GiphyLogo w="100px" />
      </Flex>
      <Flex overflowY="scroll" maxH="400px">
        <Grid
          key={debouncedInputValue}
          onGifClick={(gif, e) => {
            e.preventDefault()
            onSubmit(gif.images.downsized.url)
          }}
          fetchGifs={debouncedInputValue === '' ? fetchGifsTrending : fetchGifs}
          width={475}
          columns={3}
          className="my-4"
        />
      </Flex>
    </Stack>
  )
}
