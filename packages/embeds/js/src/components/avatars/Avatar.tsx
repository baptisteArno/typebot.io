import { isMobile } from "@/utils/isMobileSignal";
import { isNotEmpty } from "@typebot.io/lib/utils";
import { colors } from "@typebot.io/ui/colors";
import { Show, createEffect, createSignal } from "solid-js";
import { DefaultAvatar } from "./DefaultAvatar";

export const Avatar = (props: {
  src: string | undefined;
  isChatContainerLight: boolean;
}) => {
  const [avatarSrc, setAvatarSrc] = createSignal(props.src);

  createEffect(() => {
    if (
      (avatarSrc()?.startsWith("{{") || !avatarSrc()) &&
      props.src?.startsWith("http")
    )
      setAvatarSrc(props.src);
  });

  return (
    <Show
      when={isNotEmpty(avatarSrc())}
      keyed
      fallback={
        <DefaultAvatar
          backgroundColor={
            props.isChatContainerLight
              ? colors.gray.dark[2]
              : colors.gray.dark[1]
          }
        />
      }
    >
      <figure
        class={
          "flex justify-center items-center rounded-full text-white relative animate-fade-in flex-shrink-0 " +
          (isMobile() ? "w-6 h-6 text-sm" : "w-10 h-10 text-xl")
        }
      >
        <img
          src={avatarSrc()}
          alt="Bot avatar"
          class="rounded-full object-cover w-full h-full"
          elementtiming={"Bot avatar"}
          fetchpriority={"high"}
        />
      </figure>
    </Show>
  );
};
