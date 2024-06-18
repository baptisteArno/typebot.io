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
        workspaceName={'Sniper'}
        sniperName={'Lead Generation'}
        url={'https://app.sniper.io'}
        hostEmail={'host@sniper.io'}
        guestEmail={'guest@sniper.io'}
      />
    ).html
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'workspaceMemberInvitation.html'),
    render(
      <WorkspaceMemberInvitation
        workspaceName={'Sniper'}
        url={'https://app.sniper.io'}
        hostEmail={'host@sniper.io'}
        guestEmail={'guest@sniper.io'}
      />
    ).html
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'almostReachedChatsLimit.html'),
    render(
      <AlmostReachedChatsLimitEmail
        usagePercent={86}
        chatsLimit={2000}
        workspaceName="My Workspace"
      />
    ).html
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'defaultBotNotification.html'),
    render(
      <DefaultBotNotificationEmail
        resultsUrl={'https://app.sniper.io'}
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
    render(<MagicLinkEmail url={'https://app.sniper.io'} />).html
  )
}

createDistFolder()
createHtmlFile()
