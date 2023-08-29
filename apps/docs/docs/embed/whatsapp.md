# WhatsApp

WhatsApp is currently available as a private beta test. If you'd like to try it out, reach out to support@typebot.io.

## Preview

You can preview and test your bot by clicking on the Preview button in the editor and change the runtime to "WhatsApp".

## Publish

Head over to the Share tab of your bot and click on the WhatsApp button to get the integration instructions of your bot.

## Limitations

WhatsApp environment have some limitations that you need to keep in mind when building the bot:

- GIF and SVG image files are not supported. They won't be displayed.
- Buttons content can't be longer than 20 characters
- Incompatible blocks, if present, they will be skipped:
  - Payment input block
  - Chatwoot block
  - Script block
  - Google Analytics block
  - Meta Pixel blocks
  - Execute on client options

## Contact information

You can automatically assign contact name and phone number to a variable in your bot using a Set variable block with the dedicated system values:

<img src="/img/whatsapp/contact-var.png" alt="WhatsApp contact system variables" />
