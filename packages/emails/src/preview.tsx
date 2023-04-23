import { render } from '@faire/mjml-react/utils/render'
import fs from 'fs'
import path from 'path'
import {
  AlmostReachedChatsLimitEmail,
  DefaultBotNotificationEmail,
  GuestInvitationEmail,
  WorkspaceMemberInvitation,
} from './emails'
import { MagicLinkEmail } from './emails/MagicLinkEmail'

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
        usagePercent={86}
        url={'https://app.typebot.io'}
        chatsLimit={2000}
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
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'magicLink.html'),
    render(<MagicLinkEmail url={'https://app.typebot.io'} />).html
  )
}

createDistFolder()
createHtmlFile()
