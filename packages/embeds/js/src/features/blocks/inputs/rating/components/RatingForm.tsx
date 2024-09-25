import { Button } from "@/components/Button";
import { SendButton } from "@/components/SendButton";
import type { InputSubmitContent } from "@/types";
import { defaultRatingInputOptions } from "@typebot.io/blocks-inputs/rating/constants";
import type { RatingInputBlock } from "@typebot.io/blocks-inputs/rating/schema";
import { isDefined, isEmpty, isNotDefined } from "@typebot.io/lib/utils";
import { For, Match, Show, Switch, createSignal } from "solid-js";

type Props = {
  block: RatingInputBlock;
  defaultValue?: string;
  onSubmit: (value: InputSubmitContent) => void;
};

export const RatingForm = (props: Props) => {
  const [rating, setRating] = createSignal<number | undefined>(
    props.defaultValue ? Number(props.defaultValue) : undefined,
  );

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const selectedRating = rating();
    if (isNotDefined(selectedRating)) return;
    props.onSubmit({ type: "text", value: selectedRating.toString() });
  };

  const handleClick = (rating: number) => {
    if (props.block.options?.isOneClickSubmitEnabled)
      props.onSubmit({ type: "text", value: rating.toString() });

    setRating(rating);
  };

  return (
    <form class="flex flex-col gap-2" onSubmit={handleSubmit}>
      {props.block.options?.labels?.left && (
        <span class="text-sm w-full rating-label">
          {props.block.options.labels.left}
        </span>
      )}
      <div class="flex flex-wrap justify-center gap-2">
        <For
          each={Array.from(
            Array(
              (props.block.options?.length ??
                defaultRatingInputOptions.length) +
                ((props.block.options?.buttonType ??
                  defaultRatingInputOptions.buttonType) === "Numbers"
                  ? -(
                      ((props.block.options?.startsAt as number | undefined) ??
                        defaultRatingInputOptions.startsAt) - 1
                    )
                  : 0),
            ),
          )}
        >
          {(_, idx) => (
            <RatingButton
              {...props.block.options}
              rating={rating()}
              idx={
                idx() +
                ((props.block.options?.buttonType ??
                  defaultRatingInputOptions.buttonType) === "Numbers"
                  ? ((props.block.options?.startsAt as number | undefined) ??
                    defaultRatingInputOptions.startsAt)
                  : 1)
              }
              onClick={handleClick}
            />
          )}
        </For>
      </div>
      {props.block.options?.labels?.right && (
        <span class="text-sm w-full text-right pr-2 rating-label">
          {props.block.options.labels.right}
        </span>
      )}

      <div class="flex justify-end">
        {isDefined(rating()) && (
          <SendButton disableIcon>
            {props.block.options?.labels?.button ??
              defaultRatingInputOptions.labels.button}
          </SendButton>
        )}
      </div>
    </form>
  );
};

type RatingButtonProps = {
  rating?: number;
  idx: number;
  onClick: (rating: number) => void;
} & RatingInputBlock["options"];

const RatingButton = (props: RatingButtonProps) => {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    props.onClick(props.idx);
  };
  return (
    <Switch>
      <Match
        when={
          (props.buttonType ?? defaultRatingInputOptions.buttonType) ===
          "Numbers"
        }
      >
        <Show when={props.isOneClickSubmitEnabled}>
          <Button on:click={handleClick}>{props.idx}</Button>
        </Show>
        <Show when={!props.isOneClickSubmitEnabled}>
          <div
            role="checkbox"
            aria-checked={isDefined(props.rating) && props.idx <= props.rating}
            on:click={handleClick}
            class={
              "py-2 px-4 font-semibold focus:outline-none cursor-pointer select-none typebot-selectable" +
              (isDefined(props.rating) && props.idx <= props.rating
                ? " selected"
                : "")
            }
          >
            {props.idx}
          </div>
        </Show>
      </Match>
      <Match
        when={
          (props.buttonType ?? defaultRatingInputOptions.buttonType) !==
          "Numbers"
        }
      >
        <div
          class={
            "flex justify-center items-center rating-icon-container cursor-pointer " +
            (isDefined(props.rating) && props.idx <= props.rating
              ? "selected"
              : "")
          }
          innerHTML={
            props.customIcon?.isEnabled && !isEmpty(props.customIcon.svg)
              ? props.customIcon.svg
              : defaultIcon
          }
          on:click={() => props.onClick(props.idx)}
        />
      </Match>
    </Switch>
  );
};

const defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
