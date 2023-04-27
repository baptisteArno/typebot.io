import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { ChoiceInputBlock } from '@typebot.io/schemas'
import { createSignal, For } from 'solid-js'
import { Checkbox } from './Checkbox'
import { SearchInput } from '@/components/inputs/SearchInput'

type Props = {
  inputIndex: number
  defaultItems: ChoiceInputBlock['items']
  options: ChoiceInputBlock['options']
  onSubmit: (value: InputSubmitContent) => void
}

export const SearchableMultipleChoicesForm = (props: Props) => {
  let inputRef: HTMLInputElement | undefined
  const [filteredItems, setFilteredItems] = createSignal(props.defaultItems)
  const [selectedItemIds, setSelectedItemIds] = createSignal<string[]>([])

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
      value: props.defaultItems
        .filter((item) => selectedItemIds().includes(item.id))
        .map((item) => item.content)
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
      <div class="flex items-end typebot-input w-full">
        <SearchInput
          ref={inputRef}
          onInput={filterItems}
          placeholder="Filter the options..."
          onClear={() => setFilteredItems(props.defaultItems)}
        />
      </div>
      <div class="flex flex-wrap justify-end gap-2 overflow-y-scroll max-h-80 rounded-md hide-scrollbar">
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
          {props.options?.buttonLabel ?? 'Send'}
        </SendButton>
      )}
    </form>
  )
}
