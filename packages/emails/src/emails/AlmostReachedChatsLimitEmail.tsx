import React, { ComponentProps } from 'react'
import {
  Mjml,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlSpacer,
  render,
} from '@faire/mjml-react'
import { Button, Head, HeroImage, Text } from '../components'
import { parseNumberWithCommas } from 'utils'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'

type AlmostReachedChatsLimitEmailProps = {
  chatsLimit: number
  url: string
}

const now = new Date()
const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
const readableResetDate = firstDayOfNextMonth
  .toDateString()
  .split(' ')
  .slice(1, 4)
  .join(' ')

export const AlmostReachedChatsLimitEmail = ({
  chatsLimit,
  url,
}: AlmostReachedChatsLimitEmailProps) => {
  const readableChatsLimit = parseNumberWithCommas(chatsLimit)

  return (
    <Mjml>
      <Head />
      <MjmlBody width={600}>
        <MjmlSection padding="0">
          <MjmlColumn>
            <HeroImage src="https://typebot.s3.fr-par.scw.cloud/public/assets/yourBotIsFlyingEmailBanner.png" />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection padding="0 24px" cssClass="smooth">
          <MjmlColumn>
            <Text>Your bots are chatting a lot. That&apos;s amazing. 💙</Text>
            <Text>
              This means you&apos;ve almost reached your monthly chats limit.
              You currently reached 80% of {readableChatsLimit} chats.
            </Text>
            <Text>This limit will be reset on {readableResetDate}.</Text>
            <Text fontWeight={800}>
              Your bots won&apos;t start the chat if you reach the limit before
              this date❗
            </Text>
            <Text>
              If you need more monthly responses, you will need to upgrade your
              plan.
            </Text>

            <MjmlSpacer height="24px" />
            <Button link={url}>Upgrade workspace</Button>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  )
}

export const sendAlmostReachedChatsLimitEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> &
  ComponentProps<typeof AlmostReachedChatsLimitEmail>) =>
  sendEmail({
    to,
    subject: "You're close to your chats limit",
    html: render(<AlmostReachedChatsLimitEmail {...props} />).html,
  })
