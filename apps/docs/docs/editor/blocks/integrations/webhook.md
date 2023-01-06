# Webhook / API Request

The Webhook block allows you to either:

- Call a Webhook URL of a 3rd party service to send information from the bot.
- Make an API request to a 3rd party service to fetch information and use it in the bot.

## Call a Webhook URL

Your 3rd party service (Make.com, Zapier, etc) is giving you a Webhook URL.

You only have to paste this URL in the Webhook block and click on "Test the request". By default the 3rd party service will receive a snapshot of what the bot could send.

<img src="/img/blocks/integrations/webhook/simple-post.png" width="600" alt="Simple Webhook POST" />

You can also decide to customize the request sent to the 3rd party service.

## Make an API request and fetch data

This gets more technical as you'll need to know more about HTTP request parameters.

Lots of services offer an API. They also, most likely have an API documentation. Depending on the parameters you are giving the Webhook block, it should return different info from the 3rd party service.

## Custom body

You can set a custom body with your collected variables. Here is a working example:

```json
{
  "name": "{{Name}}",
  "email": "{{Email}}"
}
```

### Example: fetch movie information

Let's create a bot that ask for a movie and retrieve its informations (By sending an HTTP request to the [OMDB API](http://www.omdbapi.com/)).

From the documentation, I know that by calling this specific URL: http://www.omdbapi.com/?t=Star%20Wars&apikey=1eb4670b, it will search for "Star Wars" movie information and return JSON data.

What I need in my case is instead of inserting "Star Wars", I'd like to insert a Typebot variable:

<img src="/img/blocks/integrations/webhook/variable-url.png" width="600" alt="Variable in URL" />

Then, we can set a test value for our variable (it will replace the variable with this value only for the "Test the request" button):

<img src="/img/blocks/integrations/webhook/variable-test-value.png" width="300" alt="Variable in URL" />

Hit the "Test the request" button and then we can save the result in multiple variables:

<img src="/img/blocks/integrations/webhook/save-in-variable.png" width="400" alt="Variable in URL" />

Then we can use these variables to display dynamic content in the next bubbles:

<img src="/img/blocks/integrations/webhook/preview.png" width="600" alt="Variable in URL" />

Possibilities are endless when it comes to API calls, you can litteraly call any API and fetch any data you want.

Feel free to ask the [community](https://www.facebook.com/groups/typebot) for help if you struggle setting up a Webhook block.

## Troubleshooting

The Webhook block request fail or didn't seem to trigger? Make sure to check the [logs](/editor/results). If you still can't figure out what went wrong, shoot me a message using the chat button directly in the tool 👍
