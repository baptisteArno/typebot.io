# Self hosting

:::note
The easiest way to get started with Typebot is with [our official managed service in the Cloud](https://app.typebot.io). It takes 1 minute to create your free account. You'll have high availability, backups, security, and maintenance all managed for you by Typebot. The section below is for self-hosting Typebot on your server and managing your infrastructure.
:::

Typebot is composed of 2 Next.js applications you need to deploy:

- the builder, where you build your typebots
- the viewer, where your user answer the typebot

They are connected to a Database and an S3 bucket

## S3

Paste this bucket policy after replacing `<BUCKET_NAME>` with your bucket name:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<BUCKET_NAME>/public/*"
    }
  ]
}
```

CORS config:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

```
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_BUCKET=typebot
S3_PORT=9000
S3_ENDPOINT=localhost
S3_SSL=false
```
