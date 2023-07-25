# Meta pixel

The Pixel integration block allows you to add a Meta pixel to your bot and track specific events.

<img
  src="/img/blocks/integrations/pixel.png"
  width="600"
  alt="Pixel block"
/>

When your flow contains a pixel block, under the hood it:

- Initialize the pixel and track "PageView" event on page load.
- Track the event if any when the block is executed.
