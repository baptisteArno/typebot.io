import { Standard } from '..'
import { leadGenerationSniper } from './assets/leadGenerationSniper'

export const Default = () => {
  return (
    <div style={{ height: '500px' }}>
      <Standard
        sniper={leadGenerationSniper}
        apiHost="http://localhost:3001"
        isPreview
      />
    </div>
  )
}

export const StartWhenIntoView = () => {
  return (
    <>
      <div style={{ height: '300vh' }} />
      <Standard
        sniper={leadGenerationSniper}
        apiHost="http://localhost:3001"
        isPreview
        style={{ height: '300px' }}
      />
    </>
  )
}
