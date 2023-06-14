# Make sure to change this to your own random string of 32 characters (https://docs.typebot.io/self-hosting/docker#2-add-the-required-configuration)
export ENCRYPTION_SECRET="2GKg2i0oqWTkfc8lipjRE2weLg3R+UuI"
export NEXT_PUBLIC_VIEWER_URL="https://$TYPEBOT_VIEWER_HOST"
export DATABASE_URL="$CLOUDRON_POSTGRESQL_URL"
export NEXTAUTH_URL="$CLOUDRON_APP_ORIGIN"
export SMTP_USERNAME="$CLOUDRON_MAIL_SMTP_USERNAME"
export SMTP_PASSWORD="$CLOUDRON_MAIL_SMTP_PASSWORD"
export SMTP_HOST="$CLOUDRON_MAIL_SMTP_SERVER"
export SMTP_PORT="$CLOUDRON_MAIL_SMTP_PORT"
export NEXT_PUBLIC_SMTP_FROM="$CLOUDRON_MAIL_FROM"

# For more configuration options, see https://docs.typebot.io/self-hosting/configuration

