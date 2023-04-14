/* eslint-disable @next/next/no-img-element */
import {
  Alert,
  AlertIcon,
  Flex,
  Grid,
  GridItem,
  HStack,
  Image,
  Link,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { env, isDefined, isEmpty } from '@typebot.io/lib'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createApi } from 'unsplash-js'
import { Basic as UnsplashImage } from 'unsplash-js/dist/methods/photos/types'
import { TextInput } from '../inputs'
import { UnsplashLogo } from '../logos/UnsplashLogo'
import { TextLink } from '../TextLink'

const api = createApi({
  accessKey: env('UNSPLASH_ACCESS_KEY') ?? '',
})

type Props = {
  imageSize: 'regular' | 'small' | 'thumb'
  onImageSelect: (imageUrl: string) => void
}

export const UnsplashPicker = ({ imageSize, onImageSelect }: Props) => {
  const unsplashLogoFillColor = useColorModeValue('black', 'white')
  const [isFetching, setIsFetching] = useState(false)
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const scrollContainer = useRef<HTMLDivElement>(null)
  const bottomAnchor = useRef<HTMLDivElement>(null)

  const [nextPage, setNextPage] = useState(0)

  const fetchNewImages = useCallback(async (query: string, page: number) => {
    if (query === '') return searchRandomImages()
    if (query.length <= 2) return
    setError(null)
    setIsFetching(true)
    try {
      const result = await api.search.getPhotos({
        query,
        perPage: 30,
        orientation: 'landscape',
        page,
      })
      if (result.errors) setError(result.errors[0])
      if (isDefined(result.response)) {
        if (page === 0) setImages(result.response.results)
        else
          setImages((images) => [
            ...images,
            ...(result.response?.results ?? []),
          ])
        setNextPage((page) => page + 1)
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err)
        setError(err.message as string)
      setError('Something went wrong')
    }
    setIsFetching(false)
  }, [])

  useEffect(() => {
    if (!bottomAnchor.current) return
    const observer = new IntersectionObserver(
      (entities: IntersectionObserverEntry[]) => {
        const target = entities[0]
        if (target.isIntersecting) fetchNewImages(searchQuery, nextPage + 1)
      },
      {
        root: scrollContainer.current,
      }
    )
    if (bottomAnchor.current && nextPage > 0)
      observer.observe(bottomAnchor.current)
    return () => {
      observer.disconnect()
    }
  }, [fetchNewImages, nextPage, searchQuery])

  const searchRandomImages = async () => {
    setError(null)
    setIsFetching(true)
    try {
      const result = await api.photos.getRandom({
        count: 30,
        orientation: 'landscape',
      })

      if (result.errors) setError(result.errors[0])
      if (isDefined(result.response))
        setImages(
          Array.isArray(result.response) ? result.response : [result.response]
        )
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err)
        setError(err.message as string)
      setError('Something went wrong')
    }
    setIsFetching(false)
  }

  const selectImage = (image: UnsplashImage) => {
    const url = image.urls[imageSize]
    api.photos.trackDownload({
      downloadLocation: image.links.download_location,
    })
    if (isDefined(url)) onImageSelect(url)
  }

  useEffect(() => {
    searchRandomImages()
  }, [])

  if (isEmpty(env('UNSPLASH_ACCESS_KEY')))
    return (
      <Text>NEXT_PUBLIC_UNSPLASH_ACCESS_KEY is missing in environment</Text>
    )

  return (
    <Stack spacing={4} pt="2">
      <HStack align="center">
        <TextInput
          autoFocus
          placeholder="Search..."
          onChange={(query) => {
            setSearchQuery(query)
            fetchNewImages(query, 0)
          }}
          withVariableButton={false}
        />
        <Link
          isExternal
          href={`https://unsplash.com/?utm_source=${env(
            'UNSPLASH_APP_NAME'
          )}&utm_medium=referral`}
        >
          <UnsplashLogo width="80px" fill={unsplashLogoFillColor} />
        </Link>
      </HStack>
      {isDefined(error) && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}
      <Stack overflowY="scroll" maxH="400px" ref={scrollContainer}>
        {images.length > 0 && (
          <Grid templateColumns="repeat(4, 1fr)" columnGap={2} rowGap={3}>
            {images.map((image, index) => (
              <GridItem
                as={Stack}
                key={image.id}
                boxSize="100%"
                spacing="0"
                ref={index === images.length - 1 ? bottomAnchor : undefined}
              >
                <UnsplashImage
                  image={image}
                  onClick={() => selectImage(image)}
                />
              </GridItem>
            ))}
          </Grid>
        )}
        {isFetching && (
          <Flex justifyContent="center" py="4">
            <Spinner />
          </Flex>
        )}
      </Stack>
    </Stack>
  )
}

type UnsplashImageProps = {
  image: UnsplashImage
  onClick: () => void
}

const UnsplashImage = ({ image, onClick }: UnsplashImageProps) => {
  const linkColor = useColorModeValue('gray.500', 'gray.400')
  const { user, urls, alt_description } = image

  return (
    <>
      <Image
        objectFit="cover"
        src={urls.thumb}
        alt={alt_description ?? 'Unsplash image'}
        onClick={onClick}
        rounded="md"
        h="100%"
        cursor="pointer"
      />
      <TextLink
        fontSize="xs"
        isExternal
        href={`https://unsplash.com/@${user.username}?utm_source=${env(
          'UNSPLASH_APP_NAME'
        )}&utm_medium=referral`}
        noOfLines={1}
        color={linkColor}
      >
        {user.name}
      </TextLink>
    </>
  )
}
