import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import { Alert } from "@typebot.io/ui/components/Alert";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";
import { useCallback, useEffect, useRef, useState } from "react";
import { createApi } from "unsplash-js";
import type { Basic as UnsplashPhoto } from "unsplash-js/dist/methods/photos/types";
import { TextInput } from "../inputs/TextInput";
import { UnsplashLogo } from "../logos/UnsplashLogo";
import { TextLink } from "../TextLink";

const api = createApi({
  accessKey: env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? "",
});

type Props = {
  imageSize: "regular" | "small" | "thumb";
  onImageSelect: (imageUrl: string) => void;
};

export const UnsplashPicker = ({ imageSize, onImageSelect }: Props) => {
  const unsplashLogoFillColor = useColorModeValue("black", "white");
  const [isFetching, setIsFetching] = useState(false);
  const [images, setImages] = useState<UnsplashPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainer = useRef<HTMLDivElement>(null);
  const bottomAnchor = useRef<HTMLDivElement>(null);

  const [nextPage, setNextPage] = useState(0);

  const fetchNewImages = useCallback(async (query: string, page: number) => {
    if (query === "") return searchRandomImages();
    if (query.length <= 2) return;
    setError(null);
    setIsFetching(true);
    try {
      const result = await api.search.getPhotos({
        query,
        perPage: 30,
        orientation: "landscape",
        page,
      });
      if (result.errors) setError(result.errors[0]);
      if (isDefined(result.response)) {
        if (page === 0) setImages(result.response.results);
        else
          setImages((images) => [
            ...images,
            ...(result.response?.results ?? []),
          ]);
        setNextPage((page) => page + 1);
      }
    } catch (err) {
      if (err && typeof err === "object" && "message" in err)
        setError(err.message as string);
      setError("Something went wrong");
    }
    setIsFetching(false);
  }, []);

  useEffect(() => {
    if (!bottomAnchor.current) return;
    const observer = new IntersectionObserver(
      (entities: IntersectionObserverEntry[]) => {
        const target = entities[0];
        if (target.isIntersecting) fetchNewImages(searchQuery, nextPage + 1);
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
  }, [fetchNewImages, nextPage, searchQuery]);

  const searchRandomImages = async () => {
    setError(null);
    setIsFetching(true);
    try {
      const result = await api.photos.getRandom({
        count: 30,
        orientation: "landscape",
      });

      if (result.errors) setError(result.errors[0]);
      if (isDefined(result.response))
        setImages(
          Array.isArray(result.response) ? result.response : [result.response],
        );
    } catch (err) {
      if (err && typeof err === "object" && "message" in err)
        setError(err.message as string);
      setError("Something went wrong");
    }
    setIsFetching(false);
  };

  const selectImage = (image: UnsplashPhoto) => {
    const url = image.urls[imageSize];
    api.photos.trackDownload({
      downloadLocation: image.links.download_location,
    });
    if (isDefined(url)) onImageSelect(url);
  };

  useEffect(() => {
    searchRandomImages();
  }, []);

  if (!env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY)
    return (
      <Text>NEXT_PUBLIC_UNSPLASH_ACCESS_KEY is missing in environment</Text>
    );

  return (
    <Stack spacing={4} pt="2">
      <HStack align="center">
        <TextInput
          autoFocus
          placeholder="Search..."
          onChange={(query) => {
            setSearchQuery(query);
            fetchNewImages(query, 0);
          }}
          withVariableButton={false}
          debounceTimeout={500}
          forceDebounce
          width="full"
        />
        <a
          target="_blank"
          href={`https://unsplash.com/?utm_source=${env.NEXT_PUBLIC_UNSPLASH_APP_NAME}&utm_medium=referral`}
          rel="noopener"
        >
          <UnsplashLogo width="80px" fill={unsplashLogoFillColor} />
        </a>
      </HStack>
      {isDefined(error) && (
        <Alert.Root variant="error">
          <TriangleAlertIcon />
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      )}
      <Stack overflowY="auto" maxH="400px" ref={scrollContainer}>
        {images.length > 0 && (
          <Grid templateColumns="repeat(3, 1fr)" columnGap={2} rowGap={3}>
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
            <LoaderCircleIcon className="animate-spin" />
          </Flex>
        )}
      </Stack>
    </Stack>
  );
};

type UnsplashImageProps = {
  image: UnsplashPhoto;
  onClick: () => void;
};

const UnsplashImage = ({ image, onClick }: UnsplashImageProps) => {
  const [isImageHovered, setIsImageHovered] = useState(false);

  const { user, urls, alt_description } = image;

  return (
    <Box
      pos="relative"
      onMouseEnter={() => setIsImageHovered(true)}
      onMouseLeave={() => setIsImageHovered(false)}
      h="full"
    >
      <img
        src={urls.thumb}
        alt={alt_description ?? "Unsplash image"}
        className="object-cover h-full cursor-pointer rounded-md"
        onClick={onClick}
      />
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
          href={`https://unsplash.com/@${user.username}?utm_source=${env.NEXT_PUBLIC_UNSPLASH_APP_NAME}&utm_medium=referral`}
          noOfLines={1}
          color="white"
        >
          {user.name}
        </TextLink>
      </Box>
    </Box>
  );
};
