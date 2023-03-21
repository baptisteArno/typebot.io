# Send email

If you want to receive an email notification each time a user completes the bot or if you want to send a recap to the user, the Email block is made for you:

<img
  src="/img/blocks/integrations/email.png"
  width="400"
  alt="Email block example"
/>

By default, the email will be sent from `notifications@get-typebot.com` with default content based on what your new lead has replied to. It will look like this:

<img
  src="/img/blocks/integrations/default-email.png"
  alt="Email block example"
/>

You can choose to use your email (SMTP) account, using the "From:" dropdown and filling in your credentials.
You can also customize the email content with your text/HTML.

## Attachments

You can attach files to your email with the Attachments option. Make sure that it points to a variable that is linked to a File upload input block.

## Troubleshooting

You are supposed to receive an email but it doesn't get to your inbox? Make sure to check the [logs](/editor/results). If you still can't figure out what went wrong, shoot me a message using the chat button directly in the tool 👍
