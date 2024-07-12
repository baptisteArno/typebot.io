/* eslint-disable react-hooks/exhaustive-deps */
import {
  Alert,
  AlertIcon,
  Box,
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
import { isDefined } from '@typebot.io/lib'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient, Video, ErrorResponse, Videos } from 'pexels'
import { TextInput } from '../inputs'
import { UnsplashLogo } from '../logos/UnsplashLogo'
import { TextLink } from '../TextLink'
import { env } from '@typebot.io/env'
import usePrefetchImages from '@/hooks/usePrefetchImages'
const client = createClient(process.env.NEXT_PUBLIC_PEXELS_API_KEY as string)

type Props = {
  imageSize: 'regular' | 'small' | 'thumb'
  onImageSelect: (imageUrl: string) => void
  videoSize: 'large' | 'medium' | 'small'
  onVideoSelect: (videoUrl: string) => void
}

export const PexelsPicker = ({ videoSize, onVideoSelect }: Props) => {
  const unsplashLogoFillColor = useColorModeValue('black', 'white')
  const [isFetching, setIsFetching] = useState(false)
  const [videos, setVideos] = useState<Video[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const scrollContainer = useRef<HTMLDivElement>(null)
  const bottomAnchor = useRef<HTMLDivElement>(null)

  const [nextPage, setNextPage] = useState(0)

  const fetchNewVideos = useCallback(async (query: string, page: number) => {
    if (query === '') return getInitialVideos()
    if (query.length <= 2) return
    setError(null)
    setIsFetching(true)
    try {
      const result = await client.videos.search({
        query,
        per_page: 24,
        size: videoSize,
        orientation: 'landscape',
        page,
      })
      if ((result as ErrorResponse).error)
        setError((result as ErrorResponse).error)
      if (isDefined((result as Videos).videos)) {
        if (page === 0) setVideos((result as Videos).videos)
        else
          setVideos((videos) => [
            ...videos,
            ...((result as Videos)?.videos ?? []),
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
        if (target.isIntersecting) fetchNewVideos(searchQuery, nextPage + 1)
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
  }, [fetchNewVideos, nextPage, searchQuery])

  const getInitialVideos = async () => {
    setError(null)
    setIsFetching(true)
    client.videos
      .search({
        query: 'Hello Cat Nature Business',
        per_page: 24,
        size: videoSize,
        orientation: 'landscape',
      })
      .then((res) => {
        if ((res as ErrorResponse).error) {
          setError((res as ErrorResponse).error)
        }
        console.log((res as Videos).videos)
        setVideos((res as Videos).videos)
        setIsFetching(false)
      })
      .catch((err) => {
        if (err && typeof err === 'object' && 'message' in err)
          setError(err.message as string)
        setError('Something went wrong')
        setIsFetching(false)
      })
  }

  const selectVideo = (video: Video) => {
    const videoUrl = video.video_files[0].link
    if (isDefined(videoUrl)) onVideoSelect(videoUrl)
  }

  useEffect(() => {
    getInitialVideos()
  }, [])

  if (!env.NEXT_PUBLIC_PEXELS_API_KEY)
    return <Text>NEXT_PUBLIC_PEXELS_API_KEY is missing in environment</Text>

  return (
    <Stack spacing={4} pt="2">
      <HStack align="center">
        <TextInput
          autoFocus
          placeholder="Search..."
          onChange={(query) => {
            setSearchQuery(query)
            fetchNewVideos(query, 0)
          }}
          withVariableButton={false}
          debounceTimeout={500}
          forceDebounce
        />
        <Link
          isExternal
          href={`https://unsplash.com/?utm_source=${env.NEXT_PUBLIC_UNSPLASH_APP_NAME}&utm_medium=referral`}
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
      <Stack overflowY="auto" maxH="400px" ref={scrollContainer}>
        {videos.length > 0 && (
          <Grid templateColumns="repeat(3, 1fr)" columnGap={2} rowGap={3}>
            {videos.map((video, index) => (
              <GridItem
                as={Stack}
                key={video.id}
                boxSize="100%"
                spacing="0"
                ref={index === videos.length - 1 ? bottomAnchor : undefined}
              >
                <PexelsVideo video={video} onClick={() => selectVideo(video)} />
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

type PexelsVideoProps = {
  video: Video
  onClick: () => void
}

const PexelsVideo = ({ video, onClick }: PexelsVideoProps) => {
  const { user, video_pictures } = video
  const [isImageHovered, setIsImageHovered] = useState(false)
  const [thumbnailImage, setThumbnailImage] = useState(
    video_pictures[0].picture
  )
  const [imageIndex, setImageIndex] = useState(1)

  // Prefetch video pictures for smoother animation effect
  usePrefetchImages(video_pictures.map((picture) => picture.picture))

  useEffect(() => {
    let interval: NodeJS.Timer

    if (isImageHovered && video_pictures.length > 0) {
      interval = setInterval(() => {
        setImageIndex((prevIndex) => (prevIndex + 1) % video_pictures.length)
        setThumbnailImage(video_pictures[imageIndex].picture)
      }, 200)
    } else {
      setThumbnailImage(video_pictures[0].picture)
      setImageIndex(1)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isImageHovered, imageIndex, video_pictures])

  return (
    <Box
      pos="relative"
      onMouseEnter={() => setIsImageHovered(true)}
      onMouseLeave={() => setIsImageHovered(false)}
      h="full"
    >
      {
        <Image
          objectFit="cover"
          src={thumbnailImage}
          alt={`Pexels Video ${video.id}`}
          onClick={onClick}
          rounded="md"
          h="100%"
          aspectRatio={4 / 3}
          cursor="pointer"
        />
      }
      <Box
        pos="absolute"
        bottom={0}
        left={0}
        bgColor="rgba(0,0,0,.5)"
        px="2"
        rounded="md"
        opacity={isImageHovered ? 1 : 0}
        transition="opacity .2s ease-in-out"
      >
        <TextLink
          fontSize="xs"
          isExternal
          href={user.url}
          noOfLines={1}
          color="white"
        >
          {user.name}
        </TextLink>
      </Box>
    </Box>
  )
}
