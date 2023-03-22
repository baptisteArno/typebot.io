import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import type { RatingInputBlock, RatingInputOptions } from '@typebot.io/schemas'
import { createSignal, For, Match, Switch } from 'solid-js'
import { isDefined, isEmpty, isNotDefined } from '@typebot.io/lib'

type Props = {
  block: RatingInputBlock
  defaultValue?: string
  onSubmit: (value: InputSubmitContent) => void
}

export const RatingForm = (props: Props) => {
  const [rating, setRating] = createSignal<number | undefined>(
    props.defaultValue ? Number(props.defaultValue) : undefined
  )

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    const selectedRating = rating()
    if (isNotDefined(selectedRating)) return
    props.onSubmit({ value: selectedRating.toString() })
  }

  const handleClick = (rating: number) => {
    if (props.block.options.isOneClickSubmitEnabled)
      props.onSubmit({ value: rating.toString() })
    setRating(rating)
  }

  return (
    <form class="flex flex-col" onSubmit={handleSubmit}>
      {props.block.options.labels.left && (
        <span class="text-sm w-full mb-2 rating-label">
          {props.block.options.labels.left}
        </span>
      )}
      <div class="flex flex-wrap justify-center">
        <For
          each={Array.from(
            Array(
              props.block.options.length +
                (props.block.options.buttonType === 'Numbers' ? 1 : 0)
            )
          )}
        >
          {(_, idx) => (
            <RatingButton
              {...props.block.options}
              rating={rating()}
              idx={
                idx() + (props.block.options.buttonType === 'Numbers' ? 0 : 1)
              }
              onClick={handleClick}
            />
          )}
        </For>
      </div>
      {props.block.options.labels.right && (
        <span class="text-sm w-full text-right mb-2 pr-2 rating-label">
          {props.block.options.labels.right}
        </span>
      )}

      <div class="flex justify-end mr-2">
        {isDefined(rating()) && (
          <SendButton disableIcon>
            {props.block.options?.labels?.button ?? 'Send'}
          </SendButton>
        )}
      </div>
    </form>
  )
}

type RatingButtonProps = {
  rating?: number
  idx: number
  onClick: (rating: number) => void
} & RatingInputOptions

const RatingButton = (props: RatingButtonProps) => {
  return (
    <Switch>
      <Match when={props.buttonType === 'Numbers'}>
        <button
          on:click={(e) => {
            e.preventDefault()
            props.onClick(props.idx)
          }}
          class={
            'py-2 px-4 mr-2 mb-2 text-left font-semibold transition-all filter hover:brightness-90 active:brightness-75 duration-100 focus:outline-none typebot-button ' +
            (props.isOneClickSubmitEnabled ||
            (isDefined(props.rating) && props.idx <= props.rating)
              ? ''
              : 'selectable')
          }
        >
          {props.idx}
        </button>
      </Match>
      <Match when={props.buttonType !== 'Numbers'}>
        <div
          class={
            'flex justify-center items-center rating-icon-container cursor-pointer mr-2 mb-2 ' +
            (isDefined(props.rating) && props.idx <= props.rating
              ? 'selected'
              : '')
          }
          innerHTML={
            props.customIcon.isEnabled && !isEmpty(props.customIcon.svg)
              ? props.customIcon.svg
              : defaultIcon
          }
          on:click={() => props.onClick(props.idx)}
        />
      </Match>
    </Switch>
  )
}

const defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
