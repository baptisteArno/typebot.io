import { describe, expect, it } from "bun:test";
import { uploadFileWithPresignedPostData } from "./uploadFileWithPresignedPostData";

describe("uploadFileWithPresignedPostData", () => {
  it("uses a raw PUT request when the upload URL is a legacy proxy URL", async () => {
    let receivedMethod = "";
    let receivedContentType = "";
    let receivedCacheControl = "";
    let receivedBody = "";

    const server = Bun.serve({
      hostname: "localhost",
      port: 0,
      async fetch(request) {
        receivedMethod = request.method;
        receivedContentType = request.headers.get("content-type") ?? "";
        receivedCacheControl = request.headers.get("cache-control") ?? "";
        receivedBody = await request.text();

        return new Response(null, { status: 204 });
      },
    });

    try {
      const response = await uploadFileWithPresignedPostData({
        presignedUrl: `http://localhost:${server.port}`,
        formData: {},
        file: new File(["hello"], "hello.txt", { type: "text/plain" }),
      });

      expect(response.status).toBe(204);
      expect(receivedMethod).toBe("PUT");
      expect(receivedContentType).toStartWith("text/plain");
      expect(receivedCacheControl).toBe("public, max-age=86400");
      expect(receivedBody).toBe("hello");
    } finally {
      server.stop();
    }
  });

  it("uses a raw PUT request when an older upload response has no form data", async () => {
    let receivedMethod = "";
    let receivedBody = "";

    const server = Bun.serve({
      hostname: "localhost",
      port: 0,
      async fetch(request) {
        receivedMethod = request.method;
        receivedBody = await request.text();

        return new Response(null, { status: 204 });
      },
    });

    try {
      const response = await uploadFileWithPresignedPostData({
        presignedUrl: `http://localhost:${server.port}`,
        file: new File(["hello"], "hello.txt", { type: "text/plain" }),
      });

      expect(response.status).toBe(204);
      expect(receivedMethod).toBe("PUT");
      expect(receivedBody).toBe("hello");
    } finally {
      server.stop();
    }
  });

  it("uses multipart POST when S3 form fields are provided", async () => {
    let receivedMethod = "";
    let receivedContentType = "";
    let receivedBody = "";

    const server = Bun.serve({
      hostname: "localhost",
      port: 0,
      async fetch(request) {
        receivedMethod = request.method;
        receivedContentType = request.headers.get("content-type") ?? "";
        receivedBody = await request.text();

        return new Response(null, { status: 204 });
      },
    });

    try {
      const response = await uploadFileWithPresignedPostData({
        presignedUrl: `http://localhost:${server.port}`,
        formData: { key: "public/file.txt" },
        file: new File(["hello"], "hello.txt", { type: "text/plain" }),
      });

      expect(response.status).toBe(204);
      expect(receivedMethod).toBe("POST");
      expect(receivedContentType).toStartWith("multipart/form-data");
      expect(receivedBody).toContain('name="key"');
      expect(receivedBody).toContain("public/file.txt");
      expect(receivedBody).toContain("hello");
    } finally {
      server.stop();
    }
  });
});
