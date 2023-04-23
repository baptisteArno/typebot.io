import React, { ComponentProps } from 'react'
import {
  Mjml,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlSpacer,
} from '@faire/mjml-react'
import { render } from '@faire/mjml-react/utils/render'
import { Button, Head, HeroImage, Text } from '../components'
import { parseNumberWithCommas } from '@typebot.io/lib'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'

type AlmostReachedChatsLimitEmailProps = {
  usagePercent: number
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
  usagePercent,
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
              You currently reached {usagePercent}% of {readableChatsLimit}{' '}
              chats.
            </Text>
            <Text>This limit will be reset on {readableResetDate}.</Text>
            <Text fontWeight="800">
              Upon this limit your bots will still continue to chat, but we ask
              you kindly to upgrade your monthly chats limit.
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
