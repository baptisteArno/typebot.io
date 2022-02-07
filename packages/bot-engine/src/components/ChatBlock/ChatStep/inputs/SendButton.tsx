import React from 'react'
import { SendIcon } from '../../../../assets/icons'

type SendButtonProps = {
  label: string
  isDisabled?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const SendButton = ({
  label,
  isDisabled,
  ...props
}: SendButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isDisabled}
      {...props}
      className={
        'py-2 px-4 font-semibold rounded-md text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 typebot-button ' +
        props.className
      }
    >
      <span className="hidden xs:flex">{label}</span>
      <SendIcon className="send-icon flex xs:hidden" />
    </button>
  )
}
