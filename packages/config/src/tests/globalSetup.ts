import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import { promisify } from "node:util";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    pgContainerDatabaseUri: string;
  }
}

export default async function globalSetup(project: TestProject) {
  if (!process.env.DOCKER_HOST) {
    const execFileAsync = promisify(execFile);

    const dockerContext = await execFileAsync("docker", ["context", "show"])
      .then(({ stdout }) => stdout.trim())
      .catch(() => undefined);

    if (dockerContext) {
      const dockerContextHost = await execFileAsync("docker", [
        "context",
        "inspect",
        dockerContext,
        "--format",
        "{{.Endpoints.docker.Host}}",
      ])
        .then(({ stdout }) => stdout.trim())
        .catch(() => undefined);

      if (dockerContextHost?.startsWith("unix://")) {
        const dockerSocketPath = dockerContextHost.replace("unix://", "");
        const socketExists = await access(dockerSocketPath)
          .then(() => true)
          .catch(() => false);

        if (socketExists) process.env.DOCKER_HOST = dockerContextHost;
      }
    }
  }

  const container = await new PostgreSqlContainer("postgres:alpine")
    .start()
    .catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      throw new Error(
        `${errorMessage}. If Docker runs on a non-default socket (OrbStack/Colima), set DOCKER_HOST to your docker context host.`,
      );
    });

  console.log("*** container started", container.getConnectionUri());

  const databaseUrl = container.getConnectionUri();

  project.provide("pgContainerDatabaseUri", databaseUrl);

  return function teardown() {
    container
      .stop()
      .then(() => console.log("*** teardown -- container stopped"));
  };
}
