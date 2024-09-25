import { isMobile } from "@/utils/isMobileSignal";
import { isNotEmpty } from "@typebot.io/lib/utils";
import { Show, createEffect, createSignal } from "solid-js";
import { DefaultAvatar } from "./DefaultAvatar";

export const Avatar = (props: { initialAvatarSrc?: string }) => {
  const [avatarSrc, setAvatarSrc] = createSignal(props.initialAvatarSrc);

  createEffect(() => {
    if (
      (avatarSrc()?.startsWith("{{") || !avatarSrc()) &&
      props.initialAvatarSrc?.startsWith("http")
    )
      setAvatarSrc(props.initialAvatarSrc);
  });

  return (
    <Show when={isNotEmpty(avatarSrc())} keyed fallback={<DefaultAvatar />}>
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
