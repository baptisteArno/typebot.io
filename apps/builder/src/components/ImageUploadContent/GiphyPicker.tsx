import { type GifsResult, GiphyFetch } from "@giphy/js-fetch-api";
import { env } from "@typebot.io/env";
import { DebouncedTextInput } from "@typebot.io/ui/components/DebouncedTextInput";
import { useEffect, useRef, useState } from "react";
import { GiphyLogo } from "../logos/GiphyLogo";

type GiphySearchFormProps = {
  onSubmit: (url: string) => void;
};

const gifsPageSize = 12;

const giphyFetch = new GiphyFetch(env.NEXT_PUBLIC_GIPHY_API_KEY ?? "");

export const GiphyPicker = ({ onSubmit }: GiphySearchFormProps) => {
  const [inputValue, setInputValue] = useState("");
  const [gifs, setGifs] = useState<GifsResult["data"]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequestId = useRef(0);

  const fetchGifs = (offset: number) =>
    inputValue === ""
      ? giphyFetch.trending({ offset, limit: gifsPageSize })
      : giphyFetch.search(inputValue, { offset, limit: gifsPageSize });

  useEffect(() => {
    let isMounted = true;
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

    const fetchInitialGifs = async () => {
      setIsLoading(true);
      setIsLoadingMore(false);
      setErrorMessage(undefined);

      try {
        const { data, pagination } = await fetchGifs(0);

        if (!isMounted || latestRequestId.current !== requestId) return;

        setGifs(data);
        setOffset(pagination.offset + pagination.count);
      } catch {
        if (!isMounted || latestRequestId.current !== requestId) return;

        setErrorMessage("Could not load GIFs");
      } finally {
        if (isMounted && latestRequestId.current === requestId)
          setIsLoading(false);
      }
    };

    fetchInitialGifs();

    return () => {
      isMounted = false;
    };
  }, [inputValue]);

  const loadMoreGifs = async () => {
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

    setIsLoadingMore(true);
    setErrorMessage(undefined);

    try {
      const { data, pagination } = await fetchGifs(offset);

      if (latestRequestId.current !== requestId) return;

      setGifs((gifs) => [...gifs, ...data]);
      setOffset(pagination.offset + pagination.count);
    } catch {
      if (latestRequestId.current !== requestId) return;

      setErrorMessage("Could not load GIFs");
    } finally {
      if (latestRequestId.current === requestId) setIsLoadingMore(false);
    }
  };

  return !env.NEXT_PUBLIC_GIPHY_API_KEY ? (
    <p>NEXT_PUBLIC_GIPHY_API_KEY is missing in environment</p>
  ) : (
    <div className="flex flex-col pt-2 gap-2">
      <div className="flex items-center gap-4">
        <DebouncedTextInput
          autoFocus
          placeholder="Search..."
          onValueChange={setInputValue}
        />
        <GiphyLogo className="w-24" />
      </div>
      <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto rounded-md">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {gifs.map((gif) => (
              <button
                aria-label={`Select ${gif.title || "GIF"}`}
                className="h-32 overflow-hidden rounded-md border border-gray-200 bg-gray-50"
                key={gif.id}
                type="button"
                onClick={() => onSubmit(gif.images.downsized.url)}
              >
                <img
                  alt={gif.title || "GIF"}
                  className="h-full w-full object-cover"
                  src={gif.images.fixed_width.url}
                />
              </button>
            ))}
          </div>
        )}
        {errorMessage ? <p>{errorMessage}</p> : null}
        {!isLoading && gifs.length > 0 ? (
          <button
            className="rounded-md border border-gray-200 px-3 py-2 text-sm"
            disabled={isLoadingMore}
            type="button"
            onClick={loadMoreGifs}
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        ) : null}
      </div>
    </div>
  );
};
