import React, { useState } from 'react'
import { isDefined } from '@typebot.io/lib'
import { DefaultAvatar } from './DefaultAvatar'

export const Avatar = ({ avatarSrc }: { avatarSrc?: string }) => {
  const [currentAvatarSrc] = useState(avatarSrc)

  if (currentAvatarSrc === '') return <></>
  if (isDefined(currentAvatarSrc))
    return (
      <figure
        className={
          'flex justify-center items-center rounded-full text-white w-6 h-6 text-sm relative xs:w-10 xs:h-10 xs:text-xl'
        }
      >
        <img
          src={currentAvatarSrc}
          alt="Bot avatar"
          className="rounded-full object-cover w-full h-full"
        />
      </figure>
    )
  return <DefaultAvatar />
}
