# Octadesk Bot Builder V2

# Octadesk Bot Builder V2

This repository is a fork from typebot (http://www.typebot.io ! https://github.com/baptisteArno/typebot.io)

This fork is being used solely for bot flow construction. We do not use the bot list based on this repo, this is kept on another client.

\_\_

<p>
  <a href="https://typebot.io/#gh-light-mode-only" target="_blank">
    <img src="./.github/images/readme-illustration-light.png" alt="Typebot illustration">
  </a>
  <a href="https://typebot.io/#gh-dark-mode-only" target="_blank">
    <img src="./.github/images/readme-illustration-dark.png" alt="Typebot illustration">
  </a>
</p>

[https://raw.githubusercontent.com/baptisteArno/typebot.io/main/.github/videos/demo.mp4](https://user-images.githubusercontent.com/16015833/168876388-0310678d-080b-4eca-8633-e5cc4d7bd5d1.mp4)

Typebot is an open-source alternative to Landbot. It allows you to create conversational apps/forms (Lead qualification, Product launch, User onboarding, Customer support), embed them anywhere on your web/mobile apps, and collect results in real-time.

## Local setup

1. Clone the repo

   `git clone https://github.com/Octadesk-Tech/chat-bot-builder-client.git`

2. Set up environment variables

   Copy `apps/builder/.env.local.example` to `apps/builder/.env.local`

3. Make sure you have Docker running

4. Make sure you configured your .npmrc (https://octatech.notion.site/Github-Actions-84a2930eaea34abfaf81d3b07ac1a32b#6ef3d1fa396b438b87f229f9a1a6715e)

5. Start the application

   `yarn && yarn dev`
   Builder is available at `http://localhost:8081/typebots/{bot_id}/edit`

   The `bot_id` parameter can be found on the bots API requests of the bot you want to edit.
   Filter the API requests of one from the V2 bots list by `/chat/bots` and copy the `bot_id` parameter.

   You can add the `channel` parameter as a query string option to check other fluxes.
   For example: `http://localhost:8081/typebots/{bot_id}/edit?channel=whatsapp`

## Features

- Text, image, video bubble messages
- Text, URL, email, phone number, date... input fields
- Native integrations including Google Sheets, Webhooks, Send email (more to come)
- Conditional branching, URL redirections
- Beautiful animations
- Theme is 100% customizable
- Embed as a container, popup, or chat bubble easily with the native JS library
- In-depth analytics

For more info, visit the [landing page](https://www.typebot.io)

## Stay up-to-date

Lots of new features are being implemented on a day-to-day basis. Make sure to hit the **Star** button and watch **Releases** to be notified of future features.

<img src="./.github/images/star-project.gif" alt="Typebot illustration" style="border-radius: 10px" width="500">

## Getting started with Typebot

The easiest way to get started with Typebot is with [the official managed service in the Cloud](https://app.typebot.io).

It takes 1 minute to try out the builder for free. You'll have high availability, backups, security, and maintenance all managed for you by me, Baptiste, Typebot's founder.

That's also the best way to support my work, open-source software, and you'll get great service!

## Self-hosting

Interested in self-hosting Typebot on your server? Take a look at the [self-hosting installation instructions](https://docs.typebot.io/self-hosting).

## Contribute

Another great way to support Typebot is to contribute to the project. Head over to the [Contribute guidelines](https://github.com/baptisteArno/typebot.io/blob/main/CONTRIBUTING.md) to get started. 😍

## Technology

Typebot is a Monorepo powered by [Turborepo](https://turborepo.org/). It is composed of 2 main applications:

- the builder, where you build your typebots
- the viewer, where your user answer the typebot

These apps are built with awesome web technologies including [Typescript](https://www.typescriptlang.org/), [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/), [Chakra UI](https://chakra-ui.com/), [Tailwind CSS](https://tailwindcss.com/).

## License

Typebot is open-source under the GNU Affero General Public License Version 3 (AGPLv3). You can find it [here](./LICENSE).

In a few words, it means that:

- If you commercialize your version of Typebot. You need to be clear and provide a prominent mention and link to the original project so people that are considering using their version of the software can be aware of the original project
- If you modify the original software, you need to open source and publish your modifications
