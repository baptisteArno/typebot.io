import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import { Alert } from "@typebot.io/ui/components/Alert";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";
import { cx } from "@typebot.io/ui/lib/cva";
import { useCallback, useEffect, useRef, useState } from "react";
import { createApi } from "unsplash-js";
import type { Basic as UnsplashPhoto } from "unsplash-js/dist/methods/photos/types";
import { useThemeValue } from "@/hooks/useThemeValue";
import { DebouncedTextInput } from "../inputs/DebouncedTextInput";
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
  const unsplashLogoFillColor = useThemeValue("black", "white");
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
    return <p>NEXT_PUBLIC_UNSPLASH_ACCESS_KEY is missing in environment</p>;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex items-center gap-2">
        <DebouncedTextInput
          autoFocus
          placeholder="Search..."
          onValueChange={(query) => {
            setSearchQuery(query);
            fetchNewImages(query, 0);
          }}
          debounceTimeout={500}
        />
        <a
          target="_blank"
          href={`https://unsplash.com/?utm_source=${env.NEXT_PUBLIC_UNSPLASH_APP_NAME}&utm_medium=referral`}
          rel="noopener"
        >
          <UnsplashLogo width="80px" fill={unsplashLogoFillColor} />
        </a>
      </div>
      {isDefined(error) && (
        <Alert.Root variant="error">
          <TriangleAlertIcon />
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      )}
      <div
        className="flex flex-col gap-2 overflow-y-auto max-h-[400px]"
        ref={scrollContainer}
      >
        {images.length > 0 && (
          <div className="grid grid-cols-[repeat(3,1fr)] gap-2 gap-y-3">
            {images.map((image, index) => (
              <div
                className="flex flex-col size-full"
                key={image.id}
                ref={index === images.length - 1 ? bottomAnchor : undefined}
              >
                <UnsplashImage
                  image={image}
                  onClick={() => selectImage(image)}
                />
              </div>
            ))}
          </div>
        )}
        {isFetching && (
          <div className="flex justify-center py-4">
            <LoaderCircleIcon className="animate-spin" />
          </div>
        )}
      </div>
    </div>
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
    <div
      className="relative h-full"
      onMouseEnter={() => setIsImageHovered(true)}
      onMouseLeave={() => setIsImageHovered(false)}
    >
      <img
        src={urls.thumb}
        alt={alt_description ?? "Unsplash image"}
        className="object-cover h-full cursor-pointer rounded-md"
        onClick={onClick}
      />
      <div
        className={cx(
          "absolute px-2 rounded-md bottom-0 left-0 bg-black/50 opacity-0 transition-opacity duration-200",
          isImageHovered ? "opacity-100" : "opacity-0",
        )}
      >
        <TextLink
          className="text-xs text-white"
          isExternal
          href={`https://unsplash.com/@${user.username}?utm_source=${env.NEXT_PUBLIC_UNSPLASH_APP_NAME}&utm_medium=referral`}
        >
          {user.name}
        </TextLink>
      </div>
    </div>
  );
};
