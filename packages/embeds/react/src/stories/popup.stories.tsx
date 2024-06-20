import { Popup } from '../Popup'
import { open, toggle } from '@sniper.io/js'
import { leadGenerationSniper } from './assets/leadGenerationSniper'

export const Default = () => {
  return (
    <>
      <button onClick={open}>Open modal</button>
      <button onClick={toggle}>Toggle modal</button>
      <Popup
        sniper={leadGenerationSniper}
        apiHost="http://localhost:3001"
        autoShowDelay={3000}
        theme={{
          width: '800px',
        }}
        isPreview
      />
    </>
  )
}
