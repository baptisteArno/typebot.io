import { RatingInputOptions, RatingInputBlock } from 'models'
import React, { FormEvent, useRef, useState } from 'react'
import { isDefined, isEmpty, isNotDefined } from 'utils'
import { SendButton } from './SendButton'

type Props = {
  block: RatingInputBlock
  onSubmit: (value: string) => void
}

export const RatingForm = ({ block, onSubmit }: Props) => {
  const [rating, setRating] = useState<number>()
  const scaleElement = useRef<HTMLDivElement | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (isNotDefined(rating)) return
    onSubmit(rating.toString())
  }

  const handleClick = (rating: number) => setRating(rating)

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <div className="flex flex-col" ref={scaleElement}>
        <div className="flex">
          {Array.from(Array(block.options.length)).map((_, idx) => (
            <RatingButton
              {...block.options}
              key={idx}
              rating={rating}
              idx={idx + 1}
              onClick={handleClick}
            />
          ))}
        </div>

        <div className="flex justify-between mr-2 mb-2">
          {<span className="text-sm w-full ">{block.options.labels.left}</span>}
          {!isEmpty(block.options.labels.middle) && (
            <span className="text-sm w-full text-center">
              {block.options.labels.middle}
            </span>
          )}
          {
            <span className="text-sm w-full text-right">
              {block.options.labels.right}
            </span>
          }
        </div>
      </div>

      <div className="flex justify-end mr-2">
        {isDefined(rating) && (
          <SendButton
            label={block.options?.labels.button ?? 'Send'}
            disableIcon
          />
        )}
      </div>
    </form>
  )
}

const RatingButton = ({
  rating,
  idx,
  buttonType,
  customIcon,
  onClick,
}: Pick<RatingInputOptions, 'buttonType' | 'customIcon'> & {
  rating: number | undefined
  idx: number
  onClick: (idx: number) => void
}) => {
  if (buttonType === 'Numbers')
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          onClick(idx)
        }}
        className={
          'py-2 px-4 mr-2 mb-2 text-left font-semibold rounded-md transition-all filter hover:brightness-90 active:brightness-75 duration-100 focus:outline-none typebot-button ' +
          (isDefined(rating) && idx <= rating ? '' : 'selectable')
        }
      >
        {idx}
      </button>
    )
  return (
    <div
      className={
        'flex justify-center items-center rating-icon-container cursor-pointer mr-2 mb-2 ' +
        (isDefined(rating) && idx <= rating ? 'selected' : '')
      }
      onClick={() => onClick(idx)}
      dangerouslySetInnerHTML={{
        __html:
          customIcon.isEnabled && !isEmpty(customIcon.svg)
            ? customIcon.svg
            : defaultIcon,
      }}
    />
  )
}

const defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
