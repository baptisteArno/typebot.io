import { Popup } from '../Popup'
import { open, toggle } from '@typebot.io/js'

export const Default = () => {
  return (
    <>
      <button onClick={open}>Open modal</button>
      <button onClick={toggle}>Toggle modal</button>
      <Popup
        typebot="clctayswj000l3b6y2vkh8kwg"
        apiHost="http://localhost:3001"
        autoShowDelay={3000}
        isPreview
      />
    </>
  )
}
