<br />
<p align="center">
  <a href="https://typebot.io/#gh-light-mode-only" target="_blank">
    <img src="../.github/images/logo-light.png" alt="Typebot illustration" width="350px">
  </a>
  <a href="https://typebot.io/#gh-dark-mode-only" target="_blank">
    <img src="../.github/images/logo-dark.png" alt="Typebot illustration" width="350px">
  </a>
</p>
<br />

<a align="center" href="https://typebot.io/enterprise-lead-form">
Get a license key
</a>

## Enterprise Edition

The /ee subfolder is the place for all the Enterprise Edition features from our hosted plan.

This folder contains all the code associated to the landing page and billing features.

This Enterprise edition exists mainly to prevent people to simply fork the project and re-sell it without providing any modifications.

> ❗ WARNING: This repository is copyrighted (unlike the main repo). You are not allowed to use this code in your self-hosted instance of Typebot without obtaining a proper [license](https://typebot.io/enterprise-lead-form) first❗

### Configure STRIPE

| Parameter                     | Default | Description                               |
| ----------------------------- | ------- | ----------------------------------------- |
| NEXT_PUBLIC_STRIPE_PUBLIC_KEY |         | Stripe public key                         |
| STRIPE_SECRET_KEY             |         | Stripe secret key                         |
| STRIPE_STARTER_PRICE_ID       |         | Starter plan price id                     |
| STRIPE_PRO_PRICE_ID           |         | Pro monthly plan price id                 |
| STRIPE_STARTER_CHATS_PRICE_ID |         | Starter Additional chats monthly price id |
| STRIPE_PRO_CHATS_PRICE_ID     |         | Pro Additional chats monthly price id     |
| STRIPE_WEBHOOK_SECRET         |         | Stripe Webhook secret                     |
