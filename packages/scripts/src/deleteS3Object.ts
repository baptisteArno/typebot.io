import { env } from "@typebot.io/env";
import { initClient } from "@typebot.io/lib/s3/initClient";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";

const deleteS3Object = async () => {
  assertProductionEnvironment({ requiresDatabase: false });
  const minioClient = initClient();
  const key = await getRequiredInput({
    message: "Bucket key?",
    name: "key",
  });
  if (
    !(await confirmAction({
      message: `Delete s3://${env.S3_BUCKET}/${key} from production?`,
    }))
  )
    return;
  await minioClient.removeObject(env.S3_BUCKET, key);
};

runScript(deleteS3Object);
