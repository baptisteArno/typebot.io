import { Flex, Input, Stack } from '@chakra-ui/react'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { Grid, SearchContext } from '@giphy/react-components'
import { GiphyLogo } from 'assets/logos'
import React, { useContext, useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'

type GiphySearchProps = {
  onSubmit: (url: string) => void
}

const giphyFetch = new GiphyFetch(
  process.env.NEXT_PUBLIC_GIPHY_API_KEY as string
)

export const GiphySearch = ({ onSubmit }: GiphySearchProps) => {
  const { fetchGifs, searchKey, setSearch } = useContext(SearchContext)
  const fetchGifsTrending = (offset: number) =>
    giphyFetch.trending({ offset, limit: 10 })

  const [inputValue, setInputValue] = useState('')
  const [debouncedInputValue] = useDebounce(inputValue, 300)

  useEffect(() => {
    if (debouncedInputValue === '') return
    setSearch(debouncedInputValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputValue])

  const updateUrl = (url: string) => {
    onSubmit(url)
  }

  return (
    <Stack>
      <Flex align="center">
        <Input
          flex="1"
          autoFocus
          placeholder="Search..."
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
        />
        <GiphyLogo w="100px" />
      </Flex>
      <Flex overflowY="scroll" maxH="400px">
        <Grid
          onGifClick={(gif, e) => {
            e.preventDefault()
            updateUrl(gif.images.downsized.url)
          }}
          key={searchKey}
          fetchGifs={searchKey === '' ? fetchGifsTrending : fetchGifs}
          width={475}
          columns={3}
          className="my-4"
        />
      </Flex>
    </Stack>
  )
}
