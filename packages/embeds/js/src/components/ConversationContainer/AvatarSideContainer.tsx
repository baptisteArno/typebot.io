import { isMobile } from "@/utils/isMobileSignal";
import { isChatContainerLight } from "@typebot.io/theme/helpers/isChatContainerLight";
import type { Theme } from "@typebot.io/theme/schemas";
import { createSignal, onCleanup, onMount } from "solid-js";
import { Avatar } from "../avatars/Avatar";

type Props = {
  hideAvatar?: boolean;
  isTransitionDisabled?: boolean;
  theme: Theme;
  avatarSrc: string | undefined;
};

export const AvatarSideContainer = (props: Props) => {
  let avatarContainer: HTMLDivElement | undefined;
  const [top, setTop] = createSignal<number>(0);

  const resizeObserver = new ResizeObserver((entries) =>
    setTop(entries[0]!.target.clientHeight - (isMobile() ? 24 : 40)),
  );

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
      class={
        "flex flex-shrink-0 items-center relative typebot-avatar-container " +
        (isMobile() ? "w-6" : "w-10")
      }
    >
      <div
        class={
          "absolute flex items-center top-0" +
          (isMobile() ? " w-6 h-6" : " w-10 h-10") +
          (props.hideAvatar ? " opacity-0" : " opacity-100")
        }
        style={{
          top: `${top()}px`,
          transition: props.isTransitionDisabled
            ? undefined
            : "top 350ms ease-out, opacity 250ms ease-out",
        }}
      >
        <Avatar
          src={props.avatarSrc}
          isChatContainerLight={isChatContainerLight({
            chatContainer: props.theme.chat?.container,
            generalBackground: props.theme.general?.background,
          })}
        />
      </div>
    </div>
  );
};
