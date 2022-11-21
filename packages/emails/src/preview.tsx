import React from 'react'
import { render } from '@faire/mjml-react/dist/src/utils/render'
import fs from 'fs'
import path from 'path'
import {
  AlmostReachedChatsLimitEmail,
  AlmostReachedStorageLimitEmail,
  DefaultBotNotificationEmail,
  GuestInvitationEmail,
  ReachedChatsLimitEmail,
  ReachedStorageLimitEmail,
  WorkspaceMemberInvitation,
} from './emails'

const createDistFolder = () => {
  const dist = path.resolve(__dirname, 'dist')
  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist)
  }
}

const createHtmlFile = () => {
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'guestInvitation.html'),
    render(
      <GuestInvitationEmail
        workspaceName={'Typebot'}
        typebotName={'Lead Generation'}
        url={'https://app.typebot.io'}
        hostEmail={'baptiste@typebot.io'}
        guestEmail={'guest@typebot.io'}
      />
    ).html
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'workspaceMemberInvitation.html'),
    render(
      <WorkspaceMemberInvitation
        workspaceName={'Typebot'}
        url={'https://app.typebot.io'}
        hostEmail={'baptiste@typebot.io'}
        guestEmail={'guest@typebot.io'}
      />
    ).html
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'almostReachedChatsLimit.html'),
    render(
      <AlmostReachedChatsLimitEmail
        url={'https://app.typebot.io'}
        chatsLimit={2000}
      />
    ).html
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'almostReachedStorageLimit.html'),
    render(
      <AlmostReachedStorageLimitEmail
        url={'https://app.typebot.io'}
        storageLimit={4}
      />
    ).html
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'reachedChatsLimit.html'),
    render(
      <ReachedChatsLimitEmail
        url={'https://app.typebot.io'}
        chatsLimit={10000}
      />
    ).html
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'reachedStorageLimit.html'),
    render(
      <ReachedStorageLimitEmail
        url={'https://app.typebot.io'}
        storageLimit={8}
      />
    ).html
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'defaultBotNotification.html'),
    render(
      <DefaultBotNotificationEmail
        resultsUrl={'https://app.typebot.io'}
        answers={{
          'Group #1': 'Answer #1',
          Name: 'Baptiste',
          Email: 'baptiste.arnaud95@gmail.com',
        }}
      />
    ).html
  )
}

createDistFolder()
createHtmlFile()
