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

type Props = {
  url: string
}

export const MagicLinkEmail = ({ url }: Props) => (
  <Mjml>
    <Head />
    <MjmlBody width={600}>
      <MjmlSection padding="0">
        <MjmlColumn>
          <HeroImage src="https://s3.fr-par.scw.cloud/typebot/public/typebots/rxp84mn10va5iqek63enrg99/blocks/yfazs53p6coxe4u3tbbvkl0m" />
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection padding="0 24px" cssClass="smooth">
        <MjmlColumn>
          <Text>Here is your magic link 👇</Text>
          <MjmlSpacer />
          <Button link={url} align="center">
            Click here to sign in
          </Button>
          <Text>
            If you didn&apos;t request this, please ignore this email.
          </Text>
          <Text>
            Best,
            <br />- Typebot Team.
          </Text>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
)

export const sendMagicLinkEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> & ComponentProps<typeof MagicLinkEmail>) =>
  sendEmail({
    to,
    subject: 'Sign in to Typebot',
    html: render(<MagicLinkEmail {...props} />).html,
  })
