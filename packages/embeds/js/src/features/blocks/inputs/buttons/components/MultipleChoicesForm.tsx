import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { ChoiceInputBlock } from '@typebot.io/schemas'
import { createSignal, For } from 'solid-js'
import { Checkbox } from './Checkbox'

type Props = {
  inputIndex: number
  items: ChoiceInputBlock['items']
  options: ChoiceInputBlock['options']
  onSubmit: (value: InputSubmitContent) => void
}

export const MultipleChoicesForm = (props: Props) => {
  const [selectedIndices, setSelectedIndices] = createSignal<number[]>([])

  const handleClick = (itemIndex: number) => {
    toggleSelectedItemIndex(itemIndex)
  }

  const toggleSelectedItemIndex = (itemIndex: number) => {
    const existingIndex = selectedIndices().indexOf(itemIndex)
    if (existingIndex !== -1) {
      setSelectedIndices((selectedIndices) =>
        selectedIndices.filter((index) => index !== itemIndex)
      )
    } else {
      setSelectedIndices((selectedIndices) => [...selectedIndices, itemIndex])
    }
  }

  const handleSubmit = () =>
    props.onSubmit({
      value: selectedIndices()
        .map((itemIndex) => props.items[itemIndex].content)
        .join(', '),
    })

  return (
    <form class="flex flex-col items-end gap-2" onSubmit={handleSubmit}>
      <div class="flex flex-wrap justify-end gap-2">
        <For each={props.items}>
          {(item, index) => (
            <span class={'relative' + (isMobile() ? ' w-full' : '')}>
              <div
                role="checkbox"
                aria-checked={selectedIndices().some(
                  (selectedIndex) => selectedIndex === index()
                )}
                on:click={() => handleClick(index())}
                class={
                  'w-full py-2 px-4 font-semibold focus:outline-none cursor-pointer select-none typebot-selectable' +
                  (selectedIndices().some(
                    (selectedIndex) => selectedIndex === index()
                  )
                    ? ' selected'
                    : '')
                }
                data-itemid={item.id}
              >
                <div class="flex items-center gap-2">
                  <Checkbox
                    isChecked={selectedIndices().some(
                      (selectedIndex) => selectedIndex === index()
                    )}
                  />
                  <span>{item.content}</span>
                </div>
              </div>
            </span>
          )}
        </For>
      </div>
      {selectedIndices().length > 0 && (
        <SendButton disableIcon>
          {props.options?.buttonLabel ?? 'Send'}
        </SendButton>
      )}
    </form>
  )
}
