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
import { parseNumberWithCommas } from 'utils'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'

type ReachedChatsLimitEmailProps = {
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

export const ReachedChatsLimitEmail = ({
  chatsLimit,
  url,
}: ReachedChatsLimitEmailProps) => {
  const readableChatsLimit = parseNumberWithCommas(chatsLimit)

  return (
    <Mjml>
      <Head />
      <MjmlBody width={600}>
        <MjmlSection padding="0">
          <MjmlColumn>
            <HeroImage src="https://typebot.s3.fr-par.scw.cloud/public/assets/actionRequiredEmailBanner.png" />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection padding="0 24px" cssClass="smooth">
          <MjmlColumn>
            <Text>
              It just happened, you&apos;ve reached your monthly{' '}
              {readableChatsLimit} chats limit 😮
            </Text>
            <Text fontWeight="800">
              It means your bots are closed until {readableResetDate}❗
            </Text>
            <Text>
              If you&apos;d like to continue chatting with your users this
              month, then you need to upgrade your plan. 🚀
            </Text>

            <MjmlSpacer height="24px" />
            <Button link={url}>Upgrade workspace</Button>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  )
}

export const sendReachedChatsLimitEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> &
  ComponentProps<typeof ReachedChatsLimitEmail>) =>
  sendEmail({
    to,
    subject: "You've reached your chats limit",
    html: render(<ReachedChatsLimitEmail {...props} />).html,
  })
