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

type ReachedStorageLimitEmailProps = {
  storageLimit: number
  url: string
}

export const ReachedStorageLimitEmail = ({
  storageLimit,
  url,
}: ReachedStorageLimitEmailProps) => {
  const readableStorageLimit = `${storageLimit} GB`

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
              It just happened, you&apos;ve reached your {readableStorageLimit}{' '}
              storage limit 😮
            </Text>
            <Text fontWeight={800}>
              It means your bots won&apos;t collect new files from your users❗
            </Text>
            <Text>
              If you&apos;d like to continue collecting files, then you need to
              upgrade your plan or remove existing results to free up space. 🚀
            </Text>

            <MjmlSpacer height="24px" />
            <Button link={url}>Upgrade workspace</Button>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  )
}

export const sendReachedStorageLimitEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> &
  ComponentProps<typeof ReachedStorageLimitEmail>) =>
  sendEmail({
    to,
    subject: "You've reached your storage limit",
    html: render(<ReachedStorageLimitEmail {...props} />).html,
  })
