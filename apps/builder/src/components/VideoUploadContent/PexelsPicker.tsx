import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import { Alert } from "@typebot.io/ui/components/Alert";
import { DebouncedTextInput } from "@typebot.io/ui/components/DebouncedTextInput";
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
import { PexelsLogo } from "../logos/PexelsLogo";
import { TextLink } from "../TextLink";

const client = createClient(env.NEXT_PUBLIC_PEXELS_API_KEY ?? "dummy");
const FIRST_PEXELS_PAGE = 1;
const PEXELS_PAGE_SIZE = 24;

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
  const requestId = useRef(0);
  const isFetchingRef = useRef(false);
  const [orientation, setOrientation] = useState("landscape");
  const [size, setSize] = useState("medium");

  const [nextPage, setNextPage] = useState(0);
  const [hasMoreVideos, setHasMoreVideos] = useState(false);

  const fetchNewVideos = useCallback(
    async (
      query: string,
      page: number,
      { orientation, size }: { orientation: string; size: string },
      { replace = false }: { replace?: boolean } = {},
    ) => {
      if (!replace && isFetchingRef.current) return;

      const currentRequestId = ++requestId.current;

      if (query === "") {
        setVideos([]);
        setNextPage(0);
        setHasMoreVideos(false);
      }
      if (query.length <= 2) {
        setVideos([]);
        setNextPage(0);
        setHasMoreVideos(false);
        return;
      }
      setError(null);
      isFetchingRef.current = true;
      setIsFetching(true);
      try {
        const result = await client.videos.search({
          query,
          per_page: PEXELS_PAGE_SIZE,
          size,
          orientation,
          page,
        });
        if (currentRequestId !== requestId.current) return;
        if ((result as ErrorResponse).error)
          setError((result as ErrorResponse).error);
        if (isDefined((result as Videos).videos)) {
          const videosResult = result as Videos;
          const newVideos = videosResult.videos ?? [];

          if (page === FIRST_PEXELS_PAGE)
            setVideos(deduplicateVideosById(newVideos));
          else
            setVideos((videos) =>
              deduplicateVideosById([...videos, ...newVideos]),
            );

          const hasMore =
            newVideos.length > 0 &&
            page * PEXELS_PAGE_SIZE < videosResult.total_results;

          setHasMoreVideos(hasMore);
          setNextPage(hasMore ? page + 1 : 0);
        }
      } catch (err) {
        if (currentRequestId !== requestId.current) return;
        if (err && typeof err === "object" && "message" in err)
          setError(err.message as string);
        setError("Something went wrong");
      } finally {
        if (currentRequestId === requestId.current) {
          isFetchingRef.current = false;
          setIsFetching(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!bottomAnchor.current) return;
    const observer = new IntersectionObserver(
      (entities: IntersectionObserverEntry[]) => {
        const target = entities[0];
        if (
          target.isIntersecting &&
          hasMoreVideos &&
          nextPage > 0 &&
          !isFetchingRef.current
        )
          fetchNewVideos(searchQuery, nextPage, {
            orientation,
            size,
          });
      },
      {
        root: scrollContainer.current,
      },
    );
    if (bottomAnchor.current && hasMoreVideos && nextPage > 0 && !isFetching)
      observer.observe(bottomAnchor.current);
    return () => {
      observer.disconnect();
    };
  }, [
    fetchNewVideos,
    hasMoreVideos,
    isFetching,
    nextPage,
    searchQuery,
    orientation,
    size,
  ]);

  const selectVideo = (video: Video) => {
    const videoUrl = video.video_files[0].link;
    if (isDefined(videoUrl)) onVideoSelect(videoUrl);
  };

  const updateOrientation = (orientation: string) => {
    setOrientation(orientation);
    setVideos([]);
    setNextPage(0);
    setHasMoreVideos(false);
    fetchNewVideos(
      searchQuery,
      FIRST_PEXELS_PAGE,
      { orientation, size },
      { replace: true },
    );
  };

  const updateSize = (size: string) => {
    setSize(size);
    setVideos([]);
    setNextPage(0);
    setHasMoreVideos(false);
    fetchNewVideos(
      searchQuery,
      FIRST_PEXELS_PAGE,
      { orientation, size },
      { replace: true },
    );
  };

  if (!env.NEXT_PUBLIC_PEXELS_API_KEY)
    return <p>NEXT_PUBLIC_PEXELS_API_KEY is missing in environment</p>;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-start">
          <div className="flex flex-col gap-2">
            <DebouncedTextInput
              autoFocus
              placeholder="Search..."
              onValueChange={(query) => {
                setSearchQuery(query);
                setVideos([]);
                setNextPage(0);
                setHasMoreVideos(false);
                fetchNewVideos(
                  query,
                  FIRST_PEXELS_PAGE,
                  { orientation, size },
                  { replace: true },
                );
              }}
              debounceTimeout={500}
            />
          </div>
          <a target="_blank" href={"https://www.pexels.com"} rel="noopener">
            <PexelsLogo width="100px" height="40px" />
          </a>
        </div>
        <div className="flex items-center gap-2 w-full">
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
        </div>
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
        {videos.length > 0 && (
          <div className="grid grid-cols-[repeat(3,1fr)] gap-2 gap-y-3">
            {videos.map((video, index) => (
              <div
                className="flex flex-col size-full"
                key={video.id}
                ref={index === videos.length - 1 ? bottomAnchor : undefined}
              >
                <PexelsVideo video={video} onClick={() => selectVideo(video)} />
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

const deduplicateVideosById = (videos: Video[]) => [
  ...new Map(videos.map((video) => [video.id, video])).values(),
];

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
    <div className="group relative">
      <button
        type="button"
        className="size-full rounded-md cursor-pointer p-0 border-none bg-transparent"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
        onClick={onClick}
      >
        <img
          className={cx(
            "object-cover size-full rounded-md aspect-4/3",
            video.height < video.width ? "size-full" : undefined,
          )}
          src={thumbnailImage}
          alt={`Pexels Video ${video.id}`}
        />
      </button>
      <div className="absolute px-2 rounded-md bottom-0 left-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <TextLink className="text-xs text-white" isExternal href={url}>
          {user.name}
        </TextLink>
      </div>
    </div>
  );
};
