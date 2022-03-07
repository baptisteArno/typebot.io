import React from 'react'
import { isDefined } from 'utils'
import { DefaultAvatar } from './DefaultAvatar'

export const Avatar = ({ avatarSrc }: { avatarSrc?: string }): JSX.Element => {
  if (avatarSrc === '') return <></>
  if (isDefined(avatarSrc))
    return (
      <figure
        className={
          'flex justify-center items-center rounded-full text-white w-6 h-6 text-sm relative xs:w-10 xs:h-10 xs:text-xl'
        }
      >
        <img
          src={avatarSrc}
          alt="Bot avatar"
          className="rounded-full object-cover w-full h-full"
        />
      </figure>
    )
  return <DefaultAvatar />
}
