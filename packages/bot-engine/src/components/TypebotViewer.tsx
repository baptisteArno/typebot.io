import React from 'react'
import { PublicTypebot } from 'db'

export const TypebotViewer = (props: PublicTypebot) => {
  return <div>{props.name}</div>
}
