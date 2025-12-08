import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";
import { env } from "@typebot.io/env";
import { useState } from "react";
import { DebouncedTextInput } from "../inputs/DebouncedTextInput";
import { GiphyLogo } from "../logos/GiphyLogo";

type GiphySearchFormProps = {
  onSubmit: (url: string) => void;
};

const giphyFetch = new GiphyFetch(env.NEXT_PUBLIC_GIPHY_API_KEY ?? "");

export const GiphyPicker = ({ onSubmit }: GiphySearchFormProps) => {
  const [inputValue, setInputValue] = useState("");

  const fetchGifs = (offset: number) =>
    giphyFetch.search(inputValue, { offset, limit: 10 });

  const fetchGifsTrending = (offset: number) =>
    giphyFetch.trending({ offset, limit: 10 });

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
      <div className="flex overflow-y-auto max-h-[400px] rounded-md">
        <Grid
          key={inputValue}
          onGifClick={(gif, e) => {
            e.preventDefault();
            onSubmit(gif.images.downsized.url);
          }}
          fetchGifs={inputValue === "" ? fetchGifsTrending : fetchGifs}
          columns={3}
          width={475}
        />
      </div>
    </div>
  );
};
