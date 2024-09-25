import { SearchInput } from "@/components/inputs/SearchInput";
import type { InputSubmitContent } from "@/types";
import { isMobile } from "@/utils/isMobileSignal";
import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { isDefined, isNotEmpty, isSvgSrc } from "@typebot.io/lib/utils";
import { For, Show, createEffect, createSignal, onMount } from "solid-js";

type Props = {
  defaultItems: PictureChoiceBlock["items"];
  options: PictureChoiceBlock["options"];
  onSubmit: (value: InputSubmitContent) => void;
  onTransitionEnd: () => void;
};

export const SinglePictureChoice = (props: Props) => {
  let inputRef: HTMLInputElement | undefined;
  const [filteredItems, setFilteredItems] = createSignal(props.defaultItems);
  const [totalLoadedImages, setTotalLoadedImages] = createSignal(0);

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus({ preventScroll: true });
  });

  const handleClick = (itemIndex: number) => {
    const item = filteredItems()[itemIndex];
    if (!item) return;
    return props.onSubmit({
      type: "text",
      label: isNotEmpty(item.title) ? item.title : (item.pictureSrc ?? item.id),
      value: item.id,
    });
  };

  const filterItems = (inputValue: string) => {
    setFilteredItems(
      props.defaultItems.filter(
        (item) =>
          item.title
            ?.toLowerCase()
            .includes((inputValue ?? "").toLowerCase()) ||
          item.description
            ?.toLowerCase()
            .includes((inputValue ?? "").toLowerCase()),
      ),
    );
  };

  createEffect(() => {
    if (
      totalLoadedImages() ===
      props.defaultItems.filter((item) => isDefined(item.pictureSrc)).length
    )
      props.onTransitionEnd();
  });

  const onImageLoad = () => {
    setTotalLoadedImages((acc) => acc + 1);
  };

  return (
    <div class="flex flex-col gap-2 w-full">
      <Show when={props.options?.isSearchable}>
        <div class="flex items-end typebot-input w-full">
          <SearchInput
            ref={inputRef}
            onInput={filterItems}
            placeholder={props.options?.searchInputPlaceholder ?? ""}
            onClear={() => setFilteredItems(props.defaultItems)}
          />
        </div>
      </Show>
      <div
        class={
          "gap-2 flex flex-wrap justify-end" +
          (props.options?.isSearchable
            ? " overflow-y-scroll max-h-[464px] rounded-md"
            : "")
        }
      >
        <For each={filteredItems()}>
          {(item, index) => (
            <button
              on:click={() => handleClick(index())}
              data-itemid={item.id}
              class={
                "flex flex-col typebot-picture-button focus:outline-none filter hover:brightness-90 active:brightness-75 justify-between  " +
                (isSvgSrc(item.pictureSrc) ? "has-svg" : "")
              }
            >
              <img
                src={item.pictureSrc}
                alt={item.title ?? `Picture ${index() + 1}`}
                elementtiming={`Picture choice ${index() + 1}`}
                fetchpriority={"high"}
                class="m-auto"
                onLoad={onImageLoad}
              />
              <div
                class={
                  "flex flex-col gap-1 py-2 flex-shrink-0 px-4 w-full" +
                  (item.description ? " items-start" : "")
                }
              >
                <span class="font-semibold">{item.title}</span>
                <span class="text-sm whitespace-pre-wrap text-left">
                  {item.description}
                </span>
              </div>
            </button>
          )}
        </For>
      </div>
    </div>
  );
};
