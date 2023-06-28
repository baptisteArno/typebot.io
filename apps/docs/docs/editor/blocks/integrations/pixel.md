# Meta pixel

The Pixel integration block allows you to add a Meta pixel to your bot and track specific events.

<img
  src="/img/blocks/integrations/pixel.png"
  width="600"
  alt="Pixel block"
/>

:::note
This block is not executed in Preview mode. To test it, you need to launch the published bot.
:::

When your flow contains a pixel block, under the hood it:

- Initialize the pixel and track "PageView" event on page load.
- Track the event if any when the block is executed.

## Troubleshooting

To help you debug how your pixel behaves, I suggest you add the [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) extension to your browser.
