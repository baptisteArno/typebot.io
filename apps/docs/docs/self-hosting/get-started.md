---
sidebar_position: 1
slug: /self-hosting
---

# Getting started

Typebot is 100% open-source and can be self-hosted on your own server. The project is protected by the AGPLv3 license. Make sure to check out [this section](https://github.com/baptisteArno/typebot.io#license) before considering self-hosting the project.

You don't have to be an expert to launch your own instance of Typebot but you need a basic understanding of the command-line and networking.

If you're blocked at some point or you find that the documentation is not clear, you can reach out to us on the [forum](https://github.com/baptisteArno/typebot.io/discussions).

:::note
The easiest way to get started with Typebot is with [the official managed service in the Cloud](https://app.typebot.io). You'll have high availability, backups, security, and maintenance all managed for you by me, Baptiste, Typebot's founder.

The cloud version can save a substantial amount of developer time and resources. For most sites this ends up being the best value option and the revenue goes to funding the maintenance and further development of Typebot. So you’ll be supporting open source software and getting a great service!
:::

Typebot is composed of 2 Next.js applications you need to deploy:

- the builder, where you build your typebots
- the viewer, where your user answer the typebot

I've written guides on how to deploy Typebot using:

- [Docker](/self-hosting/docker)
- [Vercel](/self-hosting/vercel)
- [Manual](/self-hosting/manual)
