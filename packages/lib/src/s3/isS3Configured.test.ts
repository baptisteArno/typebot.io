import { describe, expect, it } from "bun:test";
import { hasS3Config } from "./isS3Configured";

describe("hasS3Config", () => {
  it("does not treat the default bucket name as a complete S3 config", () => {
    expect(hasS3Config({ S3_BUCKET: "typebot" })).toBe(false);
  });

  it("does not treat the endpoint as a complete S3 config", () => {
    expect(hasS3Config({ S3_ENDPOINT: "localhost" })).toBe(false);
  });

  it("requires the bucket, endpoint, access key, and secret key", () => {
    const config = {
      S3_BUCKET: "typebot",
      S3_ENDPOINT: "localhost",
      S3_ACCESS_KEY: "minio",
      S3_SECRET_KEY: "minio123",
    };

    expect(hasS3Config(config)).toBe(true);
    expect(hasS3Config({ ...config, S3_BUCKET: "" })).toBe(false);
    expect(hasS3Config({ ...config, S3_ENDPOINT: "" })).toBe(false);
    expect(hasS3Config({ ...config, S3_ACCESS_KEY: "" })).toBe(false);
    expect(hasS3Config({ ...config, S3_SECRET_KEY: "" })).toBe(false);
  });
});
