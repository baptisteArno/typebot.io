import { Standard } from '..'

export const Default = () => {
  return (
    <div style={{ height: '500px' }}>
      <Standard
        typebot="ladleTypebot"
        apiHost="http://localhost:3001"
        isPreview
      />
    </div>
  )
}
