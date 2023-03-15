import { Standard } from '..'
import { leadGenerationTypebot } from './assets/leadGenerationTypebot'

export const Default = () => {
  return (
    <div style={{ height: '500px' }}>
      <Standard
        typebot={leadGenerationTypebot}
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
        typebot={leadGenerationTypebot}
        apiHost="http://localhost:3001"
        isPreview
        style={{ height: '300px' }}
      />
    </>
  )
}
