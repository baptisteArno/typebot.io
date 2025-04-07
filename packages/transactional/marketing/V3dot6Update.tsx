import { Hr, Link, Text } from "@react-email/components";
import { env } from "@typebot.io/env";
import { NewsletterLayout } from "./components/NewsletterLayout";
import { NewsletterSection } from "./components/NewsletterSection";
import { hr, text } from "./styles";

const imagesBaseUrl = `${env.NEXTAUTH_URL}/images/emails/V3dot6Update`;

export const V3dot6Update = () => (
  <NewsletterLayout preview="Typebot v3.6.0 is here with a fresh new brand and exciting features! 🚀">
    <Text style={text}>
      Hey there, <br />
      <br />
      I'm thrilled to announce that Typebot v3.6.0 has just been released with a
      brand new look and a ton of powerful features!
      <br />
      <br />
      Let's dive into what's new! 🔥
    </Text>

    <NewsletterSection
      title="Introducing the New Typebot Brand"
      image={{
        src: `${imagesBaseUrl}/bento.gif`,
        alt: "New Typebot Brand",
      }}
    >
      We've unveiled a fresh new brand identity that perfectly reflects what
      Typebot is today: a powerful no-code tool for tinkerers and hackers who
      want to push the concept of chatbots to its full potential. This new look
      represents our commitment to innovation and flexibility while staying true
      to our roots.
    </NewsletterSection>

    <NewsletterSection title="New blocks: PostHog, Deepseek, and Perplexity">
      <strong>PostHog:</strong> Send events to PostHog and trigger your PostHog
      workflows. This integration works server-side, ensuring compatibility with
      non-web browser devices.
      <br />
      <br />
      <strong>Deepseek & Perplexity:</strong> Similar to our OpenAI block, these
      new integrations let you chat with Deepseek's and Perplexity's AI models,
      giving you more options for creating intelligent conversational
      experiences.
    </NewsletterSection>

    <NewsletterSection
      title="New Cards Input Block"
      image={{
        src: `${imagesBaseUrl}/cards.gif`,
        alt: "Cards Input Block Demo",
      }}
    >
      The new Cards input block allows you to display a list of cards in a
      carousel format. Each card can contain an image, a title, a description,
      and several buttons - perfect for showcasing products, services, or
      options in an engaging visual format.
    </NewsletterSection>

    <NewsletterSection title="Query Knowledge Base with Dify.AI">
      The Dify.AI block now includes a "Query knowledge base" action that
      retrieves the most relevant documents based on a query. This is perfect
      for creating context-aware AI responses - you can search for content
      relevant to the user's message and feed those chunks into your AI block
      for more accurate and informed answers.
    </NewsletterSection>

    <NewsletterSection
      title="Group Auto-Gen Titles with AI"
      image={{
        src: `${imagesBaseUrl}/group-gen-titles.gif`,
        alt: "AI-Generated Group Titles",
      }}
    >
      Say goodbye to generic "Group #" titles! Once enabled and configured, this
      feature automatically generates meaningful titles for your groups as you
      connect new blocks or groups, making your workflow more organized and
      easier to navigate.
    </NewsletterSection>

    <NewsletterSection
      title="Internal Values for Buttons and Picture Choices"
      image={{
        src: `${imagesBaseUrl}/internal-value.png`,
        alt: "Internal Values Demo",
      }}
    >
      You can now assign internal values to buttons and picture choices that
      differ from what's displayed to the user. When a user selects an option,
      the internal value is saved to your specified variable, giving you more
      flexibility in data collection and processing.
    </NewsletterSection>

    <NewsletterSection title="Notable improvements">
      <strong>Number Format Options:</strong> Format captured numbers as
      currency, percentage, scientific notation, and more in the Number input
      block.
      <br />
      <br />
      <strong>File Type Restrictions:</strong> Limit accepted file types in the
      File upload block by setting up a whitelist of file extensions.
      <br />
      <br />
      <strong>Button Layout Options:</strong> Choose between wrap and vertical
      layouts for your buttons.
      <br />
      <br />
      <strong>Customizable System Messages:</strong> Overwrite any system
      message in your bot, including error messages and notifications.
      <br />
      <br />
      <strong>Device Type Detection:</strong> The Set Variable block now
      includes a "Device type" option that automatically detects and saves
      whether your user is on desktop, tablet, or mobile.
      <br />
      <br />
      <strong>Expandable Images:</strong> Users can now click on images in your
      bot to view them in fullscreen.
    </NewsletterSection>

    <NewsletterSection title="Content and Community Highlights">
      <strong>From the Typebot Blog:</strong>
      <br />•{" "}
      <Link href="https://typebot.io/blog/faq-chatbot">
        FAQ Chatbot: A Complete Guide to Building One
      </Link>
      <br />•{" "}
      <Link href="https://typebot.io/blog/whatsapp-chatbot-use-cases">
        10 Powerful WhatsApp Chatbot Use Cases You Need to Know
      </Link>
      <br />•{" "}
      <Link href="https://typebot.io/blog/how-to-accept-payment-on-whatsapp-business">
        How to Accept Payment on WhatsApp Business: A Complete Guide
      </Link>
      <br />
      <br />
      <strong>Amazing Community Creations:</strong>
      <br />• World's first Visual Novel made with Typebot - by Anthony
      <br />• Personal Business Strategy Advisor AI Agent - by Anthony
      <br />• Pop confettis on user chatbot completion - by nefer_l <br />
      <br />
      Head over to the awesome-typebots channel in the{" "}
      <Link href="https://typebot.io/discord">community</Link> to check this all
      out!
    </NewsletterSection>

    <Hr style={hr} />

    <Text style={text}>
      Thank you for being part of the Typebot journey.
      <br />
      <br />
      As always, your feedback is invaluable, so please don't hesitate to share
      your thoughts!
      <br />
      <br />
      Happy bot hacking,
      <br />
      Baptiste
    </Text>
  </NewsletterLayout>
);

export default V3dot6Update;
