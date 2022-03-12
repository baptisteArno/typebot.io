<p>
  <a href="https://typebot.io/#gh-light-mode-only" target="_blank">
    <img src="./.github/images/readme-illustration-light.png" alt="Typebot illustration">
  </a>
  <a href="https://typebot.io/#gh-dark-mode-only" target="_blank">
    <img src="./.github/images/readme-illustration-dark.png" alt="Typebot illustration">
  </a>
</p>

Typebot is an open-source alternative to Landbot. It allows you to create conversational apps (Lead qualification, Product launch, User onboarding, Customer support), embed them anywhere on your web apps, and collect results in real-time.

## Features

- Text, image, video bubble messages
- Text, URL, email, phone number, date input fields
- Native integrations including Google Sheets, Webhooks, Send email (more to come)
- Conditional branching, URL redirections
- Beautiful animations
- Theme is 100% customizable
- Embed as a container, popup, or chat bubble with a native JS library
- In-depth analytics

#### VIDEO

## Getting started with Typebot

The easiest way to get started with Typebot is with [the official managed service in the Cloud](https://app.typebot.io).

It takes 1 minute to try out the builder for free. You'll have high availability, backups, security, and maintenance all managed for you by me, Baptiste Arnaud, Typebot's founder.

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

3. Install packages and start the applications.

   ```sh
   yarn
   ```

4. Make sure your have [docker-compose](https://docs.docker.com/compose/install/) installed

5. Start the applications:

   ```sh
   yarn dev
   ```

   Builder will be available at `http://localhost:3000`

   Viewer will be available at `http://localhost:3001`

   Database inspector will be available at `http://localhost:5555`

   By default, you can easily authenticate in the builder using the "Github Sign In" button.

## Technology

Typebot is a Monorepo powered by [Turborepo](https://turborepo.org/). It is composed of 2 main applications:

- the builder, where you build your typebots
- the viewer, where your user answer the typebot

These apps are built with awesome web technologies including [Typescript](https://www.typescriptlang.org/), [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/), [Chakra UI](https://chakra-ui.com/), [Tailwind CSS](https://tailwindcss.com/).
