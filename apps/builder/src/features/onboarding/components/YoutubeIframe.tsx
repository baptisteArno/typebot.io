import { chakra } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";

declare const window: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  YT:
    | undefined
    | {
        Player: new (
          id: string,
          options: { events: { onReady: () => void } },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) => any;
        loaded: boolean;
      };
  onYouTubeIframeAPIReady: () => void;
};

type Props = {
  id: string;
};

export const YoutubeIframe = ({ id }: Props) => {
  const initPlayer = useCallback(() => {
    if (!window.YT) return;
    const player = new window.YT.Player(id, {
      events: {
        onReady: () => {
          player.setPlaybackRate(1.2);
          player.setPlaybackQuality("");
        },
      },
    });
  }, [id]);

  useEffect(() => {
    if (window.YT?.loaded) initPlayer();
    initYoutubeIframeApi();
    window.onYouTubeIframeAPIReady = initPlayer;
  }, [initPlayer]);

  return (
    <chakra.iframe
      id={id}
      src={`https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1`}
      allowFullScreen
      allow="autoplay; fullscreen; picture-in-picture"
      boxSize="full"
      rounded="md"
    />
  );
};

const initYoutubeIframeApi = () => {
  if (document.getElementById("youtube-iframe-api")) return;
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  tag.id = "youtube-iframe-api";
  document.head.appendChild(tag);
};
