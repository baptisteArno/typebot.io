---
sidebar_position: 1
slug: /self-hosting
---

# Getting started

Typebot is 100% open-source and can be self-hosted on your own server. This guide will walk you through the process of setting up your own instance of Typebot.

:::note
The easiest way to get started with Typebot is with [the official managed service in the Cloud](https://app.typebot.io). You'll have high availability, backups, security, and maintenance all managed for you by me, Baptiste, Typebot's founder.

The cloud version can save a substantial amount of developer time and resources. For most sites this ends up being the best value option and the revenue goes to funding the maintenance and further development of Typebot. So you’ll be supporting open source software and getting a great service!
:::

|         | [Typebot Cloud](https://app.typebot.io)                                                                                                                                                                                                                                                                                                                         | Self-Hosting                                                                                                                                                                                                                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting | Easy and convenient. It takes 1 minute to start building your bots and share them with a worldwide high availability, backups, security and maintenance all done for you by me, [Baptiste, Typebot's founder](https://twitter.com/baptisteArno). I manage everything so you don’t have to worry about anything and can focus on creating great bot experiences. | You do it all yourself. You need to get a server and you need to manage your infrastructure. You are responsible for installation, maintenance, upgrades, server capacity, uptime, backup, security, stability, consistency, loading time and so on. |
| Storage | All visitor data is exclusively processed on EU-owned cloud infrastructure. This ensures that your bots data processing complies with GDPR.                                                                                                                                                                                                                     | You have full control and can host your instance on any server in any country that you wish. Host it on a server in your basement or host it with any cloud provider wherever you want.                                                              |
| Costs   | I charge a subscription fee. Whether you're a solo business owner, a growing startup or a large company, Typebot is here to help you build high-performing chat forms for the right price. Pay for as little or as much usage as you need.                                                                                                                      | You need to pay for your server, your database, your S3 storage, backups and whatever other cost there is associated with running the infrastructure. You never have to pay any fees to us.                                                          |

## License requirements

Typebot is open-source under the GNU Affero General Public License Version 3 (AGPLv3). You can find it [here](https://raw.githubusercontent.com/baptisteArno/typebot.io/main/LICENSE). The goal of the AGPLv3 license is to:

- Maximize user freedom and to encourage companies to contribute to open source.
- Prevent corporations from taking the code and using it as part of their closed-source proprietary products
- Prevent corporations from offering Typebot as a service without contributing to the open source project
- Prevent corporations from confusing people and making them think that the service they sell is in any shape or form approved by the original team

Here are the 3 different possible use cases:

<details>
  <summary>You'd like to self-host Typebot as-is without modifying the source code and you don't have the intention to commercialize your version of Typebot.</summary>

<p>

**You can host and use Typebot without restrictions. Your contributions to improve Typebot and fix bugs are welcome. 💙**

</p>

</details>

<details>
  <summary>You'd like to fork the project to build your own features on top of Typebot and you don't have the intention to commercialize your version of Typebot.</summary>
<p>

**You need to open-source your modifications**

</p>

</details>

<details>
  <summary>You'd like to commercialize your own version of Typebot</summary>

<p>

**You need to open-source your modifications.**

**After your users registration, you should provide a prominent mention and link to the original project (https://typebot.io). You should clearly mention that you provide a modified version of the official project, Typebot. It would be also a good place to explain your version advantages comparing to the original project.**

**You need to provide a link to your forked repository somewhere in the landing page or the builder. This way, interested users can easily access and review the modifications you've made.**

</p>

</details>

Typebot is composed of 2 Next.js applications you need to deploy:

- the builder, where you build your typebots
- the viewer, where your user answer the typebot

I've written guides on how to deploy Typebot using:

- [Docker](/self-hosting/guides/docker)
- [Vercel](/self-hosting/guides/vercel)
- [Manual](/self-hosting/guides/manual)
