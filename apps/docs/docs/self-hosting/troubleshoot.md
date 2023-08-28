# Troubleshoot

## My workspace is showing Free plan and 200 chats limit

You most likely forgot to set up an `ADMIN_EMAIL` variable or did not signed up using the specified email. You can also set the `DEFAULT_WORKSPACE_PLAN` variable to the value of your choice (`FREE`, `STARTER`, `PRO`, `LIFETIME`, `UNLIMITED`) to attribute the specified plan to all newly created workspaces. You can also directly connect to your database and update the `Workspace` table to change the plan of an existing workspace.

## I can't upload files

You need to add an [S3 configuration](./configuration#s3-storage-media-uploads) to your project. If you are self-hosting with Docker, you can [add a S3 service to your docker-compose file](./guides/docker#s3-storage).
