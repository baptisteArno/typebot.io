# Add a subscriber to MailerLite

1. Add a step that collects the email and set it into a variable
2. Add a Webhook step

<img src="/img/guides/mailer-lite/1.png" width="800" alt="Iframe preview"/>

3. Configure the Webhook step with the following information:

  <img src="/img/guides/mailer-lite/2.png" width="400" alt="Iframe preview"/>
  
  For more info on what fields you can add: https://developers.mailerlite.com/reference/create-a-subscriber

4. Replace "YOUR_TOKEN" with your API key. It can be found here: https://app.mailerlite.com/integrations/api/
5. Whenever the user enters his email it should add it to your subscribers' list on MailerLite
