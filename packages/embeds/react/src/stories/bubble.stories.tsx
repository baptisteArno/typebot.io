import { Bubble } from '@/Bubble'
import {
  open,
  toggle,
  close,
  showPreviewMessage,
  hidePreviewMessage,
  setPrefilledVariables,
  setInputValue,
} from '@typebot.io/js'
import { useState } from 'react'
import { leadGenerationTypebot } from './assets/leadGenerationTypebot'
import './assets/index.css'

export const Default = () => {
  const [name, setName] = useState('John')

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button onClick={toggle}>Toggle chat window</button>
        <button onClick={open}>Open chat window</button>
        <button onClick={close}>Close chat window</button>
        <button onClick={() => showPreviewMessage()}>
          Show Preview Message
        </button>
        <button onClick={() => setInputValue('YOOOO!')}>Set input value</button>
        <button onClick={hidePreviewMessage}>Close Preview Message</button>
        <div>
          <p>Predefined name:</p>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={() => setPrefilledVariables({ Name: name })}>
            Set predefined name
          </button>
        </div>
      </div>

      <Bubble
        typebot={leadGenerationTypebot}
        apiHost="http://localhost:3001"
        prefilledVariables={{
          Name: ['John'],
        }}
        previewMessage={{
          avatarUrl: 'https://avatars.githubusercontent.com/u/16015833?v=4',
          message: 'Hello, I am a preview message',
          autoShowDelay: 3000,
        }}
        theme={{
          button: {
            backgroundColor: '#FF7537',
            iconColor: 'white',
          },
        }}
        isPreview
      />
    </div>
  )
}
