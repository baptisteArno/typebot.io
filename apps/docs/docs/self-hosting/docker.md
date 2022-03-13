---
sidebar_position: 2
---

# Docker

:::note
The easiest way to get started with Typebot is with [the official managed service in the Cloud](https://app.typebot.io). It takes 1 minute to try out the tool for free. You'll have high availability, backups, security, and maintenance all managed for you by me, Baptiste, Typebot's founder.

That's also the best way to support my work, open-source software, and you'll get great service!
:::

## Requirements

You need a server with Docker installed. If your server doesn't come with Docker pre-installed, you can follow [their docs](https://docs.docker.com/get-docker/) to install it.

## Getting started

1. Fork the repository

On your server:

2. Clone the forked repo:

   ```sh
    git clone https://github.com/<your-fork>/typebot.io.git
   ```

3. Edit the `typebot-config.env` file. ([Check out the configuration guide](/self-hosting/configuration))

4. Start the applications:

   ```sh
   docker-compose up -d
   ```

   It does the following:

   - Create a database
   - Run the migrations
   - Start the builder on port 8080
   - Start the viewer on port 8081

You should see the login screen if you navigate to `http://{hostname}:8080`. Login with the `${ADMIN_EMAIL}` in order to have access to a Pro account automatically.
