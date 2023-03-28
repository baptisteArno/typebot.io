import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import type { ChoiceInputBlock } from '@typebot.io/schemas'
import { createSignal, For } from 'solid-js'

type Props = {
  inputIndex: number
  block: ChoiceInputBlock
  onSubmit: (value: InputSubmitContent) => void
}

export const ChoiceForm = (props: Props) => {
  const [selectedIndices, setSelectedIndices] = createSignal<number[]>([])

  const handleClick = (itemIndex: number) => {
    if (props.block.options?.isMultipleChoice)
      toggleSelectedItemIndex(itemIndex)
    else props.onSubmit({ value: props.block.items[itemIndex].content ?? '' })
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
        .map((itemIndex) => props.block.items[itemIndex].content)
        .join(', '),
    })

  return (
    <form class="flex flex-col items-end" onSubmit={handleSubmit}>
      <div class="flex flex-wrap justify-end">
        <For each={props.block.items}>
          {(item, index) => (
            <span class="relative inline-flex ml-2 mb-2">
              <button
                role={
                  props.block.options?.isMultipleChoice ? 'checkbox' : 'button'
                }
                type="button"
                on:click={() => handleClick(index())}
                class={
                  'py-2 px-4 text-left font-semibold transition-all filter hover:brightness-90 active:brightness-75 duration-100 focus:outline-none typebot-button ' +
                  (selectedIndices().some(
                    (selectedIndex) => selectedIndex === index()
                  ) || !props.block.options?.isMultipleChoice
                    ? ''
                    : 'selectable')
                }
                data-itemid={item.id}
              >
                {item.content}
              </button>
              {props.inputIndex === 0 && props.block.items.length === 1 && (
                <span class="flex h-3 w-3 absolute top-0 right-0 -mt-1 -mr-1 ping">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full brightness-200 opacity-75" />
                  <span class="relative inline-flex rounded-full h-3 w-3 brightness-150" />
                </span>
              )}
            </span>
          )}
        </For>
      </div>
      <div class="flex">
        {selectedIndices().length > 0 && (
          <SendButton disableIcon>
            {props.block.options?.buttonLabel ?? 'Send'}
          </SendButton>
        )}
      </div>
    </form>
  )
}
