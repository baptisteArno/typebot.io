import React from 'react'
import { PublicTypebot } from 'db'
import '../style.css'

export const TypebotViewer = (props: PublicTypebot) => {
  return <div>{props.name}</div>
}
