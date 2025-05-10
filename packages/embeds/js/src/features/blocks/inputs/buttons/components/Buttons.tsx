import { Button } from "@/components/Button";
import { SearchInput } from "@/components/inputs/SearchInput";
import type { InputSubmitContent } from "@/types";
import { isMobile } from "@/utils/isMobileSignal";
import { defaultChoiceInputOptions } from "@typebot.io/blocks-inputs/choice/constants";
import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { For, Show, createSignal, onMount } from "solid-js";

type Props = {
  chunkIndex: number;
  defaultItems: ChoiceInputBlock["items"];
  options: ChoiceInputBlock["options"];
  onSubmit: (value: InputSubmitContent) => void;
};

export const Buttons = (props: Props) => {
  let inputRef: HTMLInputElement | undefined;
  const areButtonsVisible =
    props.options?.areInitialSearchButtonsVisible ??
    defaultChoiceInputOptions.areInitialSearchButtonsVisible;
  const [filteredItems, setFilteredItems] = createSignal(
    props.options?.isSearchable && !areButtonsVisible ? [] : props.defaultItems,
  );

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus({ preventScroll: true });
  });

  const handleClick = (itemIndex: number) => {
    const item = filteredItems()[itemIndex];
    const { value, content } = item;

    props.onSubmit({
      type: "text",
      value: value || content || "",
      label: value ? content : undefined,
    });
  };

  const filterItems = (inputValue: string) => {
    if (inputValue === "" || inputValue.trim().length === 0) {
      setFilteredItems(!areButtonsVisible ? [] : props.defaultItems);
      return;
    }

    setFilteredItems(
      props.defaultItems.filter((item) =>
        item.content?.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    );
  };

  return (
    <div class="flex flex-col items-end gap-2 w-full typebot-buttons-input">
      <Show when={props.options?.isSearchable}>
        <div class="flex items-end typebot-input w-full">
          <SearchInput
            ref={inputRef}
            onInput={filterItems}
            placeholder={
              props.options?.searchInputPlaceholder ??
              defaultChoiceInputOptions.searchInputPlaceholder
            }
            onClear={() =>
              setFilteredItems(!areButtonsVisible ? [] : props.defaultItems)
            }
          />
        </div>
      </Show>

      <div
        class={
          "flex justify-end gap-2" +
          (props.options?.isSearchable
            ? " overflow-y-scroll max-h-80 rounded-md"
            : "")
        }
        data-slot="list"
      >
        <For each={filteredItems()}>
          {(item, index) => (
            <span class={"relative" + (isMobile() ? " w-full" : "")}>
              <Button
                on:click={() => handleClick(index())}
                data-itemid={item.id}
                class="w-full"
              >
                {item.content}
              </Button>
              {props.chunkIndex === 0 && props.defaultItems.length === 1 && (
                <span class="flex h-3 w-3 absolute top-0 right-0 -mt-1 -mr-1 ping">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full brightness-200 opacity-75" />
                  <span class="relative inline-flex rounded-full h-3 w-3 brightness-150" />
                </span>
              )}
            </span>
          )}
        </For>
      </div>
    </div>
  );
};
