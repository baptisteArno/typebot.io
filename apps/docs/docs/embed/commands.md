# Commands

Here are the commands you can use to trigger your embedded typebot:

- `Typebot.open()`: Open popup or bubble
- `Typebot.close()`: Close popup or bubble
- `Typebot.toggle()`: Toggle the bubble or popup open/close state,
- `Typebot.showPreviewMessage()`: Show preview message from the bubble,
- `Typebot.hidePreviewMessage()`: Hide preview message from the bubble,
- `Typebot.setPrefilledVariables(...)`: Set prefilled variables.

  Example:

  ```js
  Typebot.setPrefilledVariables({
    Name: 'Jhon',
    Email: 'john@gmail.com',
  })
  ```

  For more information, check out the [HTML & Javascript additional configurations](./html-javascript#additional-configuration)
