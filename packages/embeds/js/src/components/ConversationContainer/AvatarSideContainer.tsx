import { isChatContainerLight } from "@typebot.io/theme/helpers/isChatContainerLight";
import type { Theme } from "@typebot.io/theme/schemas";
import { cx } from "@typebot.io/ui/lib/cva";
import { createSignal, onCleanup, onMount } from "solid-js";
import { Avatar } from "../avatars/Avatar";

type Props = {
  hideAvatar?: boolean;
  isTransitionDisabled?: boolean;
  theme: Theme;
};

export const AvatarSideContainer = (props: Props) => {
  let avatarContainer: HTMLDivElement | undefined;
  const [top, setTop] = createSignal<number>(0);

  const resizeObserver = new ResizeObserver((entries) => {
    setTop(entries[0]!.target.clientHeight);
  });

  onMount(() => {
    if (avatarContainer) {
      resizeObserver.observe(avatarContainer);
    }
  });

  onCleanup(() => {
    if (avatarContainer) {
      resizeObserver.unobserve(avatarContainer);
    }
  });

  return (
    <div
      ref={avatarContainer}
      class="flex flex-shrink-0 items-center relative typebot-avatar-container w-6 @xs:w-10"
      style={{
        "--top": `${top()}px`,
      }}
    >
      <div
        class={cx(
          "absolute flex items-center w-6 h-6 @xs:w-10 @xs:h-10 top-[max(0px,calc(var(--top)-24px))] @xs:top-[max(0px,calc(var(--top)-40px))]",
          props.hideAvatar ? "opacity-0" : "opacity-100",
        )}
        style={{
          transition: props.isTransitionDisabled
            ? undefined
            : "top 350ms ease-out, opacity 250ms ease-out",
        }}
      >
        <Avatar
          src={props.theme.chat?.hostAvatar?.url}
          isChatContainerLight={isChatContainerLight({
            chatContainer: props.theme.chat?.container,
            generalBackground: props.theme.general?.background,
          })}
        />
      </div>
    </div>
  );
};
