# Forward UTM parameters to a typebot

The UTM parameter name should be listed in the Variables dropdown of your flow you can create it on any variable dropdown:

<video controls>
  <source src="/video/utm-declaration.mp4"/>
</video>

Then, if your typebot is launched with the declared UTM parameter. It should appear in the Results tab:

<video controls>
  <source src="/video/utm-in-results.mp4"/>
</video>

## Forward UTMs to a redirect link

Once you have saved the UTM values into variables like `utm_source` and `utm_value`. You can build a redirect URL in a [Redirect block](../editor/blocks/logic/redirect.md) with the same UTMs like this:

```
https://redirect-site.com?utm_source={{utm_source}}&utm_value={{utm_value}}
```
