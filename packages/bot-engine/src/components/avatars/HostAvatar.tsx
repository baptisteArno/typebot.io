import React from 'react'
import { DefaultAvatar } from './DefaultAvatar'

export const HostAvatar = ({
  typebotName,
}: {
  typebotName: string
}): JSX.Element => {
  return (
    <div className="w-full h-full rounded-full text-2xl md:text-4xl text-center xs:w-10 xs:h-10">
      <DefaultAvatar displayName={typebotName} />
    </div>
  )
}
