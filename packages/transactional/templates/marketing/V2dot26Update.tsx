import { Text, Hr } from '@react-email/components'
import * as React from 'react'
import { env } from '@typebot.io/env'
import { text, hr } from './styles'
import { NewsletterLayout } from './components/NewsletterLayout'
import { NewsletterSection } from './components/NewsletterSection'

const imagesBaseUrl = `${env.NEXTAUTH_URL}/images/emails/V2dot26Update`

export const V2dot26Update = () => (
  <NewsletterLayout preview="Unveiling Typebot's Latest Innovations - v2.26 Update! 🌟">
    <Text style={text}>
      Heya, <br />
      <br />
      Typebot v2.26 was just released. It comes with cool new stuff.
      <br />
      <br />
      Let's dive into what's new! 🔥
    </Text>

    <NewsletterSection
      title="NocoDB block"
      image={{
        src: `${imagesBaseUrl}/nocodb.jpg`,
        alt: 'New NocoDB block',
      }}
    >
      The NocoDB block is a new block that allows you to store and retrieve data
      from a NocoDB database. It's a powerful tool for building applications
      that require data storage and retrieval.
      <br />
      <br />
      Finally, a great open-source alternative to existing Google Sheets block.
    </NewsletterSection>

    <NewsletterSection
      title="Variables panel"
      image={{
        alt: 'Variables panel',
        src: `${imagesBaseUrl}/variablesPanel.gif`,
      }}
    >
      Allows you to see all your variables at a glance and edit them with much
      more comfort 💆
    </NewsletterSection>

    <NewsletterSection title="Transcript variable">
      The "Set variable" block now has a "Transcript" value option. This injects
      the entire conversation transcript in a variable. This is useful if you
      need to provide context for an AI block. <br />
      <br />
      For example you could add in a system prompt:
      <br />
      <br />
      "Your answer should be based on the context inside the &lt;context&gt; XML
      element:
      <br />
      &lt;context&gt;{'{{'}Transcript{'}}'}&lt;/context&gt;"
    </NewsletterSection>

    <NewsletterSection
      title="New container theme options"
      image={{
        alt: 'Chat window theme options demo',
        src: `${imagesBaseUrl}/chatContainerThemeOptions.gif`,
      }}
    >
      You can now customize the chat window theme with the new container theme
      options. This allows you to change the background color, border color, and
      text color of the chat window.
    </NewsletterSection>

    <NewsletterSection title="New templates">
      🏃 Quick Carb Calculator - Designed specifically for athlete fueling
      brands looking to attract and engage active audiences, this chatbot serves
      as an effective lead magnet by providing instant, customized carbohydrate
      intake recommendations based on user input.
      <br />
      <br />
      💆‍♀️ Skin Typology - A skin typology expert bot designed as a lead magnet
      for Typology, this bot asks a series of personalized questions to
      determine the user's unique skin type. He then receives a detailed
      diagnosis and tailored skincare AI-based recommendations.
    </NewsletterSection>

    <Hr style={hr} />

    <Text style={{ ...text, marginBottom: '60px' }}>
      As always, your feedback is invaluable, so please don't hesitate to share
      your thoughts.
      <br />
      <br />
      Baptiste.
    </Text>
  </NewsletterLayout>
)

export default V2dot26Update
