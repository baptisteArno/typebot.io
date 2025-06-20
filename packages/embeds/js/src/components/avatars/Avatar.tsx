import { isNotEmpty, isSvgSrc } from "@typebot.io/lib/utils";
import { colors } from "@typebot.io/ui/colors";
import { Match, Show, Switch } from "solid-js";
import { DefaultAvatar } from "./DefaultAvatar";

export const Avatar = (props: {
  src: string | undefined;
  isChatContainerLight: boolean;
}) => {
  return (
    <Show
      when={isNotEmpty(props.src)}
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
      <Switch>
        <Match when={isEmoji(props.src ?? "")}>
          <span class="text-4xl text-[40px]">{props.src}</span>
        </Match>
        <Match when={isSvgSrc(props.src)}>
          <img
            src={props.src}
            alt="Bot avatar"
            class="flex justify-center items-center relative animate-fade-in flex-shrink-0 w-6 h-6 text-sm @xs:w-10 @xs:h-10 @xs:text-xl"
            elementtiming={"Bot avatar"}
          />
        </Match>
        <Match when={true}>
          <figure class="flex justify-center items-center rounded-full text-white relative animate-fade-in flex-shrink-0 w-6 h-6 text-sm @xs:w-10 @xs:h-10 @xs:text-xl">
            <img
              src={props.src}
              alt="Bot avatar"
              class="rounded-full object-cover w-full h-full"
              elementtiming={"Bot avatar"}
              fetchpriority={"high"}
            />
          </figure>
        </Match>
      </Switch>
    </Show>
  );
};

const isEmoji = (src: string) => {
  return /^\p{Emoji}$/u.test(src);
};
