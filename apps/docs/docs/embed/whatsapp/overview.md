---
sidebar_position: 1
slug: /embed/whatsapp
title: Overview
---

# WhatsApp

WhatsApp integration is currently in beta. If you encounter any issue, please contact me directly using the Bubble in app.typebot.io.

## Preview

You can preview and test your bot by clicking on the Preview button in the editor and change the runtime to "WhatsApp".

<img src="/img/whatsapp/preview-dropdown.png" alt="WhatsApp preview dropdown" width="600px" />

## Limitations

WhatsApp environment have some limitations that you need to keep in mind when building the bot:

- GIF and SVG image files are not supported. They won't be displayed.
- Buttons content can't be longer than 20 characters. If the content is longer, it will be truncated.
- Incompatible blocks, if present, they will be skipped:

  - Payment input block
  - Chatwoot block
  - Script block
  - Google Analytics block
  - Meta Pixel blocks

## Contact information

You can automatically assign contact name and phone number to a variable in your bot using a Set variable block with the dedicated system values:

<img src="/img/whatsapp/contact-var.png" alt="WhatsApp contact system variables" width="600px" />

## Deploy on your phone number

Head over to the Share tab of your bot and click on the WhatsApp button to get the integration instructions of your bot.

### Configuration

You can customize how your bot behaves on WhatsApp in the `Configure integration` section

<img src="/img/whatsapp/configure-integration.png" alt="WhatsApp configure integration" width="600px" />

**Session expiration timeout**: A number from 0 to 48 which is the number of hours after which the session will expire. If the user doesn't interact with the bot for more than the timeout, the session will expire and if user sends a new message, it will start a new chat. The default is 4 hours.

**Start bot condition**: A condition that will be evaluated when a user starts a conversation with your bot. If the condition is not met, the bot will not be triggered.

## FAQ

### How many WhatsApp numbers can I use?

You can integrate as many numbers as you'd like. Keep in mind that Typebot does not provide those numbers. We work as a "Bring your own Meta application" and we give you clear instructions on [how to set up your Meta app](./whatsapp/create-meta-app).

### Can I link multiple bots to the same WhatsApp number?

Yes, you can. You will have to add a "Start bot condition" to each of your bots to make sure that the right bot is triggered when a user starts a conversation.

### Does the integration with WhatsApp requires any paid API?

You integrate your typebots with your own WhatsApp Business Platform which is the official service from Meta. At the moment, the first 1,000 Service conversations each month are free. For more information, refer to [their documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started#pricing---payment-methods)
