import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import { Alert } from "@typebot.io/ui/components/Alert";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";
import { cx } from "@typebot.io/ui/lib/cva";
import {
  createClient,
  type ErrorResponse,
  type Video,
  type Videos,
} from "pexels";
import { useCallback, useEffect, useRef, useState } from "react";
import { BasicSelect } from "../inputs/BasicSelect";
import { TextInput } from "../inputs/TextInput";
import { PexelsLogo } from "../logos/PexelsLogo";
import { TextLink } from "../TextLink";

const client = createClient(env.NEXT_PUBLIC_PEXELS_API_KEY ?? "dummy");

type Props = {
  onVideoSelect: (videoUrl: string) => void;
};

export const PexelsPicker = ({ onVideoSelect }: Props) => {
  const [isFetching, setIsFetching] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainer = useRef<HTMLDivElement>(null);
  const bottomAnchor = useRef<HTMLDivElement>(null);
  const [orientation, setOrientation] = useState("landscape");
  const [size, setSize] = useState("medium");

  const [nextPage, setNextPage] = useState(0);

  const fetchNewVideos = useCallback(
    async (
      query: string,
      page: number,
      { orientation, size }: { orientation: string; size: string },
    ) => {
      if (query === "") setVideos([]);
      if (query.length <= 2) {
        setNextPage(0);
        return;
      }
      setError(null);
      setIsFetching(true);
      try {
        const result = await client.videos.search({
          query,
          per_page: 24,
          size,
          orientation,
          page,
        });
        if ((result as ErrorResponse).error)
          setError((result as ErrorResponse).error);
        if (isDefined((result as Videos).videos)) {
          if (page === 0) setVideos((result as Videos).videos);
          else
            setVideos((videos) => [
              ...videos,
              ...((result as Videos)?.videos ?? []),
            ]);

          setNextPage((page) => page + 1);
        }
      } catch (err) {
        if (err && typeof err === "object" && "message" in err)
          setError(err.message as string);
        setError("Something went wrong");
      }
      setIsFetching(false);
    },
    [],
  );

  useEffect(() => {
    if (!bottomAnchor.current) return;
    const observer = new IntersectionObserver(
      (entities: IntersectionObserverEntry[]) => {
        const target = entities[0];
        if (target.isIntersecting)
          fetchNewVideos(searchQuery, nextPage + 1, {
            orientation,
            size,
          });
      },
      {
        root: scrollContainer.current,
      },
    );
    if (bottomAnchor.current && nextPage > 0)
      observer.observe(bottomAnchor.current);
    return () => {
      observer.disconnect();
    };
  }, [fetchNewVideos, nextPage, searchQuery, orientation, size]);

  const selectVideo = (video: Video) => {
    const videoUrl = video.video_files[0].link;
    if (isDefined(videoUrl)) onVideoSelect(videoUrl);
  };

  const updateOrientation = (orientation: string) => {
    setOrientation(orientation);
    fetchNewVideos(searchQuery, 0, { orientation, size });
  };

  const updateSize = (size: string) => {
    setSize(size);
    fetchNewVideos(searchQuery, 0, { orientation, size });
  };

  if (!env.NEXT_PUBLIC_PEXELS_API_KEY)
    return <Text>NEXT_PUBLIC_PEXELS_API_KEY is missing in environment</Text>;

  return (
    <Stack spacing={4} pt="2">
      <Stack>
        <HStack align="flex-start">
          <Stack>
            <TextInput
              autoFocus
              placeholder="Search..."
              onChange={(query) => {
                setSearchQuery(query);
                fetchNewVideos(query, 0, { orientation, size });
              }}
              withVariableButton={false}
              debounceTimeout={500}
              forceDebounce
              width="full"
            />
          </Stack>
          <a target="_blank" href={`https://www.pexels.com`} rel="noopener">
            <PexelsLogo width="100px" height="40px" />
          </a>
        </HStack>
        <HStack w="full">
          <BasicSelect
            value={orientation}
            onChange={updateOrientation}
            items={[
              { label: "Landscape", value: "landscape" },
              { label: "Portrait", value: "portrait" },
              { label: "Square", value: "square" },
            ]}
          />
          <BasicSelect
            value={size}
            onChange={updateSize}
            items={[
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ]}
          />
        </HStack>
      </Stack>
      {isDefined(error) && (
        <Alert.Root variant="error">
          <TriangleAlertIcon />
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
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
            <LoaderCircleIcon className="animate-spin" />
          </Flex>
        )}
      </Stack>
    </Stack>
  );
};

type PexelsVideoProps = {
  video: Video;
  onClick: () => void;
};

const PexelsVideo = ({ video, onClick }: PexelsVideoProps) => {
  const { user, url, video_pictures } = video;
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState(
    video_pictures[0].picture,
  );
  const [imageIndex, setImageIndex] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timer;

    if (isImageHovered && video_pictures.length > 0) {
      interval = setInterval(() => {
        setImageIndex((prevIndex) => (prevIndex + 1) % video_pictures.length);
        setThumbnailImage(video_pictures[imageIndex].picture);
      }, 200);
    } else {
      setThumbnailImage(video_pictures[0].picture);
      setImageIndex(1);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isImageHovered, imageIndex, video_pictures]);

  return (
    <Box
      pos="relative"
      onMouseEnter={() => setIsImageHovered(true)}
      onMouseLeave={() => setIsImageHovered(false)}
    >
      {
        <img
          className={cx(
            "object-cover size-full cursor-pointer rounded-md aspect-[4/3]",
            video.height < video.width ? "size-full" : undefined,
          )}
          src={thumbnailImage}
          alt={`Pexels Video ${video.id}`}
          onClick={onClick}
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
          href={url}
          noOfLines={1}
          color="white"
        >
          {user.name}
        </TextLink>
      </Box>
    </Box>
  );
};
