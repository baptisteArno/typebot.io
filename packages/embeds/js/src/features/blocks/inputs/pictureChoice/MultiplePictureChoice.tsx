import { SendButton } from "@/components/SendButton";
import { SearchInput } from "@/components/inputs/SearchInput";
import type { InputSubmitContent } from "@/types";
import { isMobile } from "@/utils/isMobileSignal";
import { defaultPictureChoiceOptions } from "@typebot.io/blocks-inputs/pictureChoice/constants";
import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import {
  isDefined,
  isEmpty,
  isNotEmpty,
  isSvgSrc,
} from "@typebot.io/lib/utils";
import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import { Checkbox } from "../buttons/components/Checkbox";

type Props = {
  defaultItems: PictureChoiceBlock["items"];
  options: PictureChoiceBlock["options"];
  onSubmit: (value: InputSubmitContent) => void;
  onTransitionEnd: () => void;
};

export const MultiplePictureChoice = (props: Props) => {
  let inputRef: HTMLInputElement | undefined;
  const [filteredItems, setFilteredItems] = createSignal(props.defaultItems);
  const [selectedItemIds, setSelectedItemIds] = createSignal<string[]>([]);
  const [totalLoadedImages, setTotalLoadedImages] = createSignal(0);

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus({ preventScroll: true });
  });

  const handleClick = (itemId: string) => {
    toggleSelectedItemId(itemId);
  };

  const toggleSelectedItemId = (itemId: string) => {
    const existingIndex = selectedItemIds().indexOf(itemId);
    if (existingIndex !== -1) {
      setSelectedItemIds((selectedItemIds) =>
        selectedItemIds.filter((selectedItemId) => selectedItemId !== itemId),
      );
    } else {
      setSelectedItemIds((selectedIndices) => [...selectedIndices, itemId]);
    }
  };

  const handleSubmit = () =>
    props.onSubmit({
      type: "text",
      value: selectedItemIds()
        .map((selectedItemId) => {
          const item = props.defaultItems.find(
            (item) => item.id === selectedItemId,
          );
          return isNotEmpty(item?.title) ? item.title : item?.pictureSrc;
        })
        .join(", "),
    });

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
    <form class="flex flex-col gap-2 w-full items-end" onSubmit={handleSubmit}>
      <Show when={props.options?.isSearchable}>
        <div class="flex items-end typebot-input w-full">
          <SearchInput
            ref={inputRef}
            onInput={filterItems}
            placeholder={
              props.options?.searchInputPlaceholder ??
              defaultPictureChoiceOptions.searchInputPlaceholder
            }
            onClear={() => setFilteredItems(props.defaultItems)}
          />
        </div>
      </Show>
      <div
        class={
          "flex flex-wrap justify-end gap-2" +
          (props.options?.isSearchable
            ? " overflow-y-scroll max-h-[464px] rounded-md"
            : "")
        }
      >
        <For each={filteredItems()}>
          {(item, index) => (
            <div
              role="checkbox"
              aria-checked={selectedItemIds().some(
                (selectedItemId) => selectedItemId === item.id,
              )}
              on:click={() => handleClick(item.id)}
              class={
                "flex flex-col focus:outline-none cursor-pointer select-none typebot-selectable-picture" +
                (selectedItemIds().some(
                  (selectedItemId) => selectedItemId === item.id,
                )
                  ? " selected"
                  : "") +
                (isSvgSrc(item.pictureSrc) ? " has-svg" : "")
              }
              data-itemid={item.id}
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
                  "flex gap-3 py-2 flex-shrink-0" +
                  (isEmpty(item.title) && isEmpty(item.description)
                    ? " justify-center"
                    : " px-3")
                }
              >
                <Checkbox
                  isChecked={selectedItemIds().some(
                    (selectedItemId) => selectedItemId === item.id,
                  )}
                  class={
                    "flex-shrink-0" +
                    (item.title || item.description ? " mt-1" : undefined)
                  }
                />
                <Show when={item.title || item.description}>
                  <div class="flex flex-col gap-1 ">
                    <Show when={item.title}>
                      <span class="font-semibold">{item.title}</span>
                    </Show>
                    <Show when={item.description}>
                      <span class="text-sm whitespace-pre-wrap text-left">
                        {item.description}
                      </span>
                    </Show>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
        <For
          each={selectedItemIds()
            .filter((selectedItemId) =>
              filteredItems().every((item) => item.id !== selectedItemId),
            )
            .map((selectedItemId) =>
              props.defaultItems.find((item) => item.id === selectedItemId),
            )
            .filter(isDefined)}
        >
          {(selectedItem, index) => (
            <div
              role="checkbox"
              aria-checked
              on:click={() => handleClick(selectedItem.id)}
              class={
                "flex flex-col focus:outline-none cursor-pointer select-none typebot-selectable-picture selected"
              }
              data-itemid={selectedItem.id}
            >
              <img
                src={
                  props.defaultItems.find((item) => item.id === selectedItem.id)
                    ?.pictureSrc
                }
                alt={selectedItem.title ?? `Selected picture ${index() + 1}`}
                elementtiming={`Selected picture choice ${index() + 1}`}
                fetchpriority={"high"}
              />
              <div
                class={
                  "flex gap-3 py-2 flex-shrink-0" +
                  (isEmpty(selectedItem.title) &&
                  isEmpty(selectedItem.description)
                    ? " justify-center"
                    : " pl-4")
                }
              >
                <Checkbox
                  isChecked={selectedItemIds().some(
                    (selectedItemId) => selectedItemId === selectedItem.id,
                  )}
                  class={
                    "flex-shrink-0" +
                    (selectedItem.title || selectedItem.description
                      ? " mt-1"
                      : undefined)
                  }
                />
                <Show when={selectedItem.title || selectedItem.description}>
                  <div class="flex flex-col gap-1 ">
                    <Show when={selectedItem.title}>
                      <span class="font-semibold">{selectedItem.title}</span>
                    </Show>
                    <Show when={selectedItem.description}>
                      <span class="text-sm whitespace-pre-wrap text-left">
                        {selectedItem.description}
                      </span>
                    </Show>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
      {selectedItemIds().length > 0 && (
        <SendButton disableIcon>
          {props.options?.buttonLabel ??
            defaultPictureChoiceOptions.buttonLabel}
        </SendButton>
      )}
    </form>
  );
};
