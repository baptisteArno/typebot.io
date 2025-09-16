import { Popup } from '../Popup'
import { open, toggle } from '@typebot.io/js'
import { leadGenerationTypebot } from './assets/leadGenerationTypebot'

export const Default = () => {
  return (
    <>
      <button onClick={open}>Open modal</button>
      <button onClick={toggle}>Toggle modal</button>
      <Popup
        typebot={leadGenerationTypebot}
        apiHost="http://localhost:3003"
        autoShowDelay={3000}
        theme={{
          width: '800px',
        }}
        isPreview
      />
    </>
  )
}
