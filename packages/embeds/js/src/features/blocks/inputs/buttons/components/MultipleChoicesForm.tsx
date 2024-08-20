import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import { ChoiceInputBlock } from '@typebot.io/schemas'
import { createSignal, For, onMount, Show } from 'solid-js'
import { Checkbox } from './Checkbox'
import { SearchInput } from '@/components/inputs/SearchInput'
import { defaultChoiceInputOptions } from '@typebot.io/schemas/features/blocks/inputs/choice/constants'

type Props = {
  defaultItems: ChoiceInputBlock['items']
  options: ChoiceInputBlock['options']
  onSubmit: (value: InputSubmitContent) => void
}

export const MultipleChoicesForm = (props: Props) => {
  let inputRef: HTMLInputElement | undefined
  const [filteredItems, setFilteredItems] = createSignal(props.defaultItems)
  const [selectedItemIds, setSelectedItemIds] = createSignal<string[]>([])

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus({ preventScroll: true })
  })

  const handleClick = (itemId: string) => {
    toggleSelectedItemId(itemId)
  }

  const toggleSelectedItemId = (itemId: string) => {
    const existingIndex = selectedItemIds().indexOf(itemId)
    if (existingIndex !== -1) {
      setSelectedItemIds((selectedItemIds) =>
        selectedItemIds.filter((selectedItemId) => selectedItemId !== itemId)
      )
    } else {
      setSelectedItemIds((selectedIndices) => [...selectedIndices, itemId])
    }
  }

  const handleSubmit = () =>
    props.onSubmit({
      type: 'text',
      value: selectedItemIds()
        .map(
          (selectedItemId) =>
            props.defaultItems.find((item) => item.id === selectedItemId)
              ?.content
        )
        .join(', '),
    })

  const filterItems = (inputValue: string) => {
    setFilteredItems(
      props.defaultItems.filter((item) =>
        item.content?.toLowerCase().includes((inputValue ?? '').toLowerCase())
      )
    )
  }

  return (
    <form class="flex flex-col items-end gap-2 w-full" onSubmit={handleSubmit}>
      <Show when={props.options?.isSearchable}>
        <div class="flex items-end typebot-input w-full">
          <SearchInput
            ref={inputRef}
            onInput={filterItems}
            placeholder={
              props.options?.searchInputPlaceholder ??
              defaultChoiceInputOptions.searchInputPlaceholder
            }
            onClear={() => setFilteredItems(props.defaultItems)}
          />
        </div>
      </Show>
      <div
        class={
          'flex flex-wrap justify-end gap-2' +
          (props.options?.isSearchable
            ? ' overflow-y-scroll max-h-80 rounded-md'
            : '')
        }
      >
        <For each={filteredItems()}>
          {(item) => (
            <span class={'relative' + (isMobile() ? ' w-full' : '')}>
              <div
                role="checkbox"
                aria-checked={selectedItemIds().some(
                  (selectedItemId) => selectedItemId === item.id
                )}
                on:click={() => handleClick(item.id)}
                class={
                  'w-full py-2 px-4 font-semibold focus:outline-none cursor-pointer select-none typebot-selectable' +
                  (selectedItemIds().some(
                    (selectedItemId) => selectedItemId === item.id
                  )
                    ? ' selected'
                    : '')
                }
                data-itemid={item.id}
              >
                <div class="flex items-center gap-2">
                  <Checkbox
                    isChecked={selectedItemIds().some(
                      (selectedItemId) => selectedItemId === item.id
                    )}
                    class="flex-shrink-0"
                  />
                  <span>{item.content}</span>
                </div>
              </div>
            </span>
          )}
        </For>
        <For
          each={selectedItemIds().filter((selectedItemId) =>
            filteredItems().every((item) => item.id !== selectedItemId)
          )}
        >
          {(selectedItemId) => (
            <span class={'relative' + (isMobile() ? ' w-full' : '')}>
              <div
                role="checkbox"
                aria-checked
                on:click={() => handleClick(selectedItemId)}
                class={
                  'w-full py-2 px-4 font-semibold focus:outline-none cursor-pointer select-none typebot-selectable selected'
                }
                data-itemid={selectedItemId}
              >
                <div class="flex items-center gap-2">
                  <Checkbox isChecked />
                  <span>
                    {
                      props.defaultItems.find(
                        (item) => item.id === selectedItemId
                      )?.content
                    }
                  </span>
                </div>
              </div>
            </span>
          )}
        </For>
      </div>
      {selectedItemIds().length > 0 && (
        <SendButton disableIcon>
          {props.options?.buttonLabel ?? defaultChoiceInputOptions.buttonLabel}
        </SendButton>
      )}
    </form>
  )
}
