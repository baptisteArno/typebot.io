---
sidebar_position: 4
---

# HTML & Javascript

## Standard

You can get the standard HTML and Javascript code by clicking on the "HTML & Javascript" button in the "Share" tab of your typebot.

There, you can change the container dimensions. Here is a code example:

```html
<script type="module">
  import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.0/dist/web.js'

  Typebot.initStandard({
    typebot: 'my-typebot',
  })
</script>

<typebot-standard style="width: 100%; height: 600px; "></typebot-standard>
```

This code is creating a container with a 100% width (will match parent width) and 600px height.

## Popup

You can get the popup HTML and Javascript code by clicking on the "HTML & Javascript" button in the "Share" tab of your typebot.

Here is an example:

```html
<script type="module">
  import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.0/dist/web.js'

  Typebot.initPopup({
    typebot: 'my-typebot',
    apiHost: 'http://localhost:3001',
    autoShowDelay: 3000,
  })
</script>
```

This code will automatically trigger the popup window after 3 seconds.

### Open or Close a popup

You can use these commands:

```js
Typebot.open()
```

```js
Typebot.close()
```

```js
Typebot.toggle()
```

You can bind these commands on a button element, for example:

```html
<button onclick="Typebot.open()">Contact us</button>
```

### Multiple bots

If you have different bots on the same page you will have to make them distinct with an additional `id` prop:

```html
<script type="module">
  import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.0/dist/web.js'

  Typebot.initStandard({
    id: 'bot1'
    typebot: 'my-typebot',
  })

  Typebot.initStandard({
    id: 'bot2'
    typebot: 'my-typebot-2',
  })
</script>

<typebot-standard
  id="bot1"
  style="width: 100%; height: 600px; "
></typebot-standard>
...
<typebot-standard
  id="bot2"
  style="width: 100%; height: 600px; "
></typebot-standard>
```

## Bubble

You can get the bubble HTML and Javascript code by clicking on the "HTML & Javascript" button in the "Share" tab of your typebot.

Here is an example:

```html
<script type="module">
  import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.0/dist/web.js'

  Typebot.initBubble({
    typebot: 'my-typebot',
    previewMessage: {
      message: 'I have a question for you!',
      autoShowDelay: 5000,
      avatarUrl: 'https://avatars.githubusercontent.com/u/16015833?v=4',
    },
    theme: {
      button: { backgroundColor: '#0042DA', iconColor: '#FFFFFF' },
      previewMessage: { backgroundColor: '#ffffff', textColor: 'black' },
      chatWindow: { backgroundColor: '#ffffff' },
    },
  })
</script>
```

This code will show the bubble and let a preview message appear after 5 seconds.

### Open or close the preview message

You can use these commands:

```js
Typebot.showPreviewMessage()
```

```js
Typebot.hidePreviewMessage()
```

### Open or close the typebot

You can use these commands:

```js
Typebot.open()
```

```js
Typebot.close()
```

```js
Typebot.toggle()
```

You can bind these commands on a button element, for example:

```html
<button onclick="Typebot.open()">Contact us</button>
```

### Custom button position

You can move the button with some custom CSS on your website. For example, you can place the bubble button higher with the following CSS:

```css
typebot-bubble::part(button) {
  bottom: 60px;
}

typebot-bubble::part(bot) {
  bottom: 140px;
}

typebot-bubble::part(bot) {
  bottom: 140px;  height: calc(100% - 140px)
}
```

If you have a preview message, you'll also have to manually position it:

```css
typebot-bubble::part(preview-message) {
  bottom: 140px;
}
```

## Additional configuration

You can prefill the bot variable values in your embed code by adding the `prefilledVariables` option. Here is an example:

```js
Typebot.initStandard({
  typebot: 'my-typebot',
  prefilledVariables: {
    'Current URL': 'https://my-site/account',
    'User name': 'John Doe',
  },
})
```

It will prefill the `Current URL` variable with "https://my-site/account" and the `User name` variable with "John Doe". More info about variables: [here](/editor/variables).

Note that if your site URL contains query params (i.e. https://typebot.io?User%20name=John%20Doe), the variables will automatically be injected to the typebot. So you don't need to manually transfer query params to the bot embed configuration.
