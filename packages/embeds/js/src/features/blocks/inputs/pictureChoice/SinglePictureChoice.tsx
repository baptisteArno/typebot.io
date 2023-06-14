import { SearchInput } from '@/components/inputs/SearchInput'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import { isSvgSrc } from '@typebot.io/lib/utils'
import { PictureChoiceBlock } from '@typebot.io/schemas/features/blocks/inputs/pictureChoice'
import { For, Show, createSignal, onMount } from 'solid-js'

type Props = {
  defaultItems: PictureChoiceBlock['items']
  options: PictureChoiceBlock['options']
  onSubmit: (value: InputSubmitContent) => void
}

export const SinglePictureChoice = (props: Props) => {
  let inputRef: HTMLInputElement | undefined
  const [filteredItems, setFilteredItems] = createSignal(props.defaultItems)

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus()
  })

  // eslint-disable-next-line solid/reactivity
  const handleClick = (itemIndex: number) => () => {
    const pictureSrc = filteredItems()[itemIndex].pictureSrc
    if (!pictureSrc) return
    return props.onSubmit({
      value: filteredItems()[itemIndex].title ?? pictureSrc,
    })
  }

  const filterItems = (inputValue: string) => {
    setFilteredItems(
      props.defaultItems.filter(
        (item) =>
          item.title
            ?.toLowerCase()
            .includes((inputValue ?? '').toLowerCase()) ||
          item.description
            ?.toLowerCase()
            .includes((inputValue ?? '').toLowerCase())
      )
    )
  }

  return (
    <div class="flex flex-col gap-2 w-full">
      <Show when={props.options.isSearchable}>
        <div class="flex items-end typebot-input w-full">
          <SearchInput
            ref={inputRef}
            onInput={filterItems}
            placeholder={props.options.searchInputPlaceholder ?? ''}
            onClear={() => setFilteredItems(props.defaultItems)}
          />
        </div>
      </Show>
      <div
        class={
          'gap-2 flex flex-wrap justify-end' +
          (props.options.isSearchable
            ? ' overflow-y-scroll max-h-[464px] rounded-md hide-scrollbar'
            : '')
        }
      >
        <For each={filteredItems()}>
          {(item, index) => (
            <button
              // eslint-disable-next-line solid/reactivity
              on:click={handleClick(index())}
              data-itemid={item.id}
              class={
                'flex flex-col typebot-picture-button focus:outline-none filter hover:brightness-90 active:brightness-75 justify-between  ' +
                (isSvgSrc(item.pictureSrc) ? 'has-svg' : '')
              }
            >
              <img
                src={item.pictureSrc}
                alt={item.title ?? `Picture ${index() + 1}`}
                elementtiming={`Picture choice ${index() + 1}`}
                fetchpriority={'high'}
                class="m-auto"
              />
              <div
                class={
                  'flex flex-col gap-1 py-2 flex-shrink-0 px-4 w-full' +
                  (item.description ? ' items-start' : '')
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
  )
}
