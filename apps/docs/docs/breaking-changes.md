# Breaking changes

## Typebot v6

- List variables now don't automatically display the last item when inserted into a bubble. It was too "magical". Now you can leverage the inline code feature to easily get the last element of a list:

  ```
  {{={{List var}}.at(-1)=}}
  ```

  Check out the new [Inline variable formatting section](./editor/variables) for more information.

- Input prefill is now disabled by default. You can still enable it in the [Settings](./editor/settings) tab of your bot.
