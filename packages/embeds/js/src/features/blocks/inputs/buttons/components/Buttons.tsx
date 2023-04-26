import { Button } from '@/components/Button'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { ChoiceInputBlock } from '@typebot.io/schemas'
import { For } from 'solid-js'

type Props = {
  inputIndex: number
  items: ChoiceInputBlock['items']
  onSubmit: (value: InputSubmitContent) => void
}

export const Buttons = (props: Props) => {
  // eslint-disable-next-line solid/reactivity
  const handleClick = (itemIndex: number) => () =>
    props.onSubmit({ value: props.items[itemIndex].content ?? '' })

  return (
    <div class="flex flex-wrap justify-end gap-2">
      <For each={props.items}>
        {(item, index) => (
          <span class={'relative' + (isMobile() ? ' w-full' : '')}>
            <Button
              on:click={handleClick(index())}
              data-itemid={item.id}
              class="w-full"
            >
              {item.content}
            </Button>
            {props.inputIndex === 0 && props.items.length === 1 && (
              <span class="flex h-3 w-3 absolute top-0 right-0 -mt-1 -mr-1 ping">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full brightness-200 opacity-75" />
                <span class="relative inline-flex rounded-full h-3 w-3 brightness-150" />
              </span>
            )}
          </span>
        )}
      </For>
    </div>
  )
}
