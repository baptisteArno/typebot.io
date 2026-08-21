import { describe, expect, it } from "bun:test";
import {
  assertProductionEnvironment,
  confirmAction,
  getBooleanInput,
  getCliOption,
  getIdentifierInput,
  getRequiredInput,
  promptAndSetEnvironment,
} from "./cli";

describe("shared script CLI contract", () => {
  it("reads both supported long-option forms", () => {
    expect(getCliOption(["--email=user@example.com"], "email")).toBe(
      "user@example.com",
    );
    expect(getCliOption(["--email", "user@example.com"], "email")).toBe(
      "user@example.com",
    );
    expect(getCliOption(["--confirm"], "confirm")).toBe(true);
    expect(getCliOption(["--no-confirm"], "confirm")).toBe(false);
  });

  it("uses flags without opening a prompt", async () => {
    await expect(
      getRequiredInput({
        args: ["--workspace-id=workspace-1"],
        message: "Workspace ID?",
        name: "workspace-id",
      }),
    ).resolves.toBe("workspace-1");

    await expect(
      getIdentifierInput({
        args: ["--email=user@example.com"],
        message: "Select way",
        options: [
          { label: "ID", name: "id" },
          { label: "Email", name: "email" },
        ],
      }),
    ).resolves.toEqual({ type: "email", value: "user@example.com" });
  });

  it("fails fast when required non-interactive input is absent", async () => {
    await expect(
      getRequiredInput({ args: [], message: "Email?", name: "email" }),
    ).rejects.toThrow("Missing required --email=<value>");
  });

  it("requires explicit non-interactive confirmation", async () => {
    await expect(
      confirmAction({ args: [], message: "Delete it?" }),
    ).rejects.toThrow("Refusing to continue without --confirm");
    await expect(
      confirmAction({ args: ["--confirm"], message: "Delete it?" }),
    ).resolves.toBe(true);
    await expect(
      confirmAction({ args: ["--no-confirm"], message: "Delete it?" }),
    ).resolves.toBe(false);
  });

  it("honors forced non-interactive defaults", async () => {
    await expect(
      getBooleanInput({
        args: ["--non-interactive"],
        defaultValue: false,
        flag: "compute-results",
        message: "Compute results?",
      }),
    ).resolves.toBe(false);
  });

  it("accepts Nx as the environment selector", async () => {
    await expect(
      promptAndSetEnvironment({
        args: [],
        environment: { NX_TASK_TARGET_CONFIGURATION: "production" },
      }),
    ).resolves.toBe("production");
  });

  it("guards the production database contract", () => {
    expect(() =>
      assertProductionEnvironment({
        environment: {
          DATABASE_URL: "mysql://production.example.com/typebot",
          NX_TASK_TARGET_CONFIGURATION: "production",
        },
      }),
    ).not.toThrow();
    expect(() =>
      assertProductionEnvironment({
        environment: {
          DATABASE_URL: "postgresql://localhost/typebot",
          NX_TASK_TARGET_CONFIGURATION: "production",
        },
      }),
    ).toThrow("Production DATABASE_URL must be a MySQL URL");
  });
});
