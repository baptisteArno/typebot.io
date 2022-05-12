# Theme

The theme tab allows you to customize the look of your typebot.

## Custom CSS

You can also decide to customize even further by adding any custom CSS you want. For this you right-click on the bot in the Theme page and inspect the element you want to customize:

<img
  src="/img/theme/custom-css.png"
  alt="Custom css inspection"
/>

For example, if I want my buttons to be more rounded, and have a fancy gradient color, I can add this to the custom CSS:

```css
.typebot-button {
  border-radius: 40px;
  background-image: linear-gradient(to right, #e052a0, #f15c41);
  border: none;
}
```

<img
  src="/img/theme/fancy-button.png"
  alt="Fancy button"
/>
