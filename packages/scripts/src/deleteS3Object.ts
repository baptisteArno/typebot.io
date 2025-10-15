import * as p from "@clack/prompts";
import { env } from "@typebot.io/env";
import { initClient } from "@typebot.io/lib/s3/initClient";

const deleteS3Object = async () => {
  const minioClient = initClient();
  const key = await p.text({
    message: "Bucket key?",
  });
  if (!key || typeof key !== "string") {
    console.log("No object key provided");
    return;
  }
  await minioClient.removeObject(env.S3_BUCKET, key);
};

deleteS3Object();
