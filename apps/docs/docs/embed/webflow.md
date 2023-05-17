# Webflow

Head over to the Share tab of your bot and click on the Webflow button to get the embed instructions of your bot.

## Advanced guides

### Trigger a typebot command on a click of a button

1. Head over to the `Settings` tab of your button and add a dedicated `ID`
2. In your typebot `Embed` element, insert this code in the existing `<script>` tag. It should look like:

```html
<script type="module">
  import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.0/dist/web.js'

  Typebot.initPopup({
    typebot: 'my-typebot',
  })

  document.getElementById('<MY_ID>').addEventListener('click', (event) => {
    event.preventDefault()
    Typebot.open()
  })
</script>
```

Make sure to replace `<MY_ID>` with the ID you added on your button element.

In this example we are opening the popup when the button is clicked but you could also use any of the [available commands](./commands).
