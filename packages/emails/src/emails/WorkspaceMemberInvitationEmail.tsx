import React, { ComponentProps } from 'react'
import {
  Mjml,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlSpacer,
} from '@faire/mjml-react'
import { render } from '@faire/mjml-react/utils/render'
import { HeroImage, Text, Button, Head } from '../components'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'

type WorkspaceMemberInvitationProps = {
  workspaceName: string
  url: string
  hostEmail: string
  guestEmail: string
}

export const WorkspaceMemberInvitation = ({
  workspaceName,
  url,
  hostEmail,
  guestEmail,
}: WorkspaceMemberInvitationProps) => (
  <Mjml>
    <Head />
    <MjmlBody width={600}>
      <MjmlSection padding="0">
        <MjmlColumn>
          <HeroImage src="https://typebot.s3.eu-west-3.amazonaws.com/assets/invitation-banner.png" />
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection padding="0 24px" cssClass="smooth">
        <MjmlColumn>
          <Text>
            You have been invited by {hostEmail} to collaborate on his workspace{' '}
            <strong>{workspaceName}</strong> as a team member.
          </Text>
          <Text>
            From now on you will see this workspace in your dashboard 👍
          </Text>
          <Text>
            Make sure to log in as <i>{guestEmail}</i>.
          </Text>
          <MjmlSpacer height="24px" />
          <Button link={url}>Go to workspace</Button>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
)

export const sendWorkspaceMemberInvitationEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> &
  ComponentProps<typeof WorkspaceMemberInvitation>) =>
  sendEmail({
    to,
    subject: "You've been invited to collaborate 🤝",
    html: render(<WorkspaceMemberInvitation {...props} />).html,
  })
