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
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'

type AlmostReachedStorageLimitEmailProps = {
  storageLimit: number
  url: string
}

export const AlmostReachedStorageLimitEmail = ({
  storageLimit,
  url,
}: AlmostReachedStorageLimitEmailProps) => {
  const readableStorageLimit = `${storageLimit} GB`

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
            <Text>Your bots are working a lot. That&apos;s amazing. 🤖</Text>
            <Text>
              This means you&apos;ve almost reached your storage limit. You
              currently reached 80% of your {readableStorageLimit} storage
              limit.
            </Text>
            <Text fontWeight={800}>
              Your bots won&apos;t collect new files once you reach the limit❗
            </Text>
            <Text>
              To make sure it won&apos;t happen, you need to upgrade your plan
              or delete existing results to free up space.
            </Text>
            <MjmlSpacer height="24px" />
            <Button link={url}>Upgrade workspace</Button>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  )
}

export const sendAlmostReachedStorageLimitEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> &
  ComponentProps<typeof AlmostReachedStorageLimitEmail>) =>
  sendEmail({
    to,
    subject: "You're close to your storage limit",
    html: render(<AlmostReachedStorageLimitEmail {...props} />).html,
  })
