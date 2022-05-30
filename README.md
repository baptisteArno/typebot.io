This repository is a fork from typebot (http://www.typebot.io ! https://github.com/baptisteArno/typebot.io)

__

<p>
  <a href="https://typebot.io/#gh-light-mode-only" target="_blank">
    <img src="./.github/images/readme-illustration-light.png" alt="Typebot illustration">
  </a>
  <a href="https://typebot.io/#gh-dark-mode-only" target="_blank">
    <img src="./.github/images/readme-illustration-dark.png" alt="Typebot illustration">
  </a>
</p>

Typebot is an open-source alternative to Landbot. It allows you to create conversational apps/forms (Lead qualification, Product launch, User onboarding, Customer support), embed them anywhere on your web/mobile apps, and collect results in real-time.

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

## Local setup

1. Clone the repo

   ```sh
   git clone https://github.com/baptisteArno/typebot.io.git
   ```

2. Set up environment variables

   Copy `apps/builder/.env.local.example` to `apps/builder/.env.local`

   Copy `apps/viewer/.env.local.example` to `apps/viewer/.env.local`

   Check out the [Configuration guide](https://docs.typebot.io/self-hosting/configuration) if you want to enable more options

3. Make sure you have [Docker](https://docs.docker.com/compose/install/) running
4. Start the applications.

   ```sh
   yarn && yarn dev
   ```

   Builder is available at `http://localhost:3000`

   Viewer is available at `http://localhost:3001`

   Database inspector is available at `http://localhost:5555`

   By default, you can easily authenticate in the builder using the "Github Sign In" button. For other options, check out the [Configuration guide](https://docs.typebot.io/self-hosting/configuration)

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
