import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { z } from "zod";

const scriptsRoot = join(import.meta.dir, "..");
const packageJson = z
  .object({
    nx: z.object({
      targets: z.record(
        z.string(),
        z.object({
          configurations: z
            .record(z.string(), z.record(z.string(), z.unknown()))
            .optional(),
          defaultConfiguration: z.string().optional(),
        }),
      ),
    }),
    scripts: z.record(z.string(), z.string()),
  })
  .parse(JSON.parse(readFileSync(join(scriptsRoot, "package.json"), "utf8")));

describe("@typebot.io/scripts CLI contract", () => {
  it("only exposes existing entry points and exposes every operational script", () => {
    const exposedEntryPoints = Object.values(packageJson.scripts).flatMap(
      (command) => command.match(/src\/[\w/]+\.(?:tsx|ts)/g) ?? [],
    );

    for (const entryPoint of exposedEntryPoints)
      expect(existsSync(join(scriptsRoot, entryPoint))).toBe(true);

    const operationalScripts = readdirSync(join(scriptsRoot, "src"), {
      withFileTypes: true,
    })
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith(".ts") &&
          !entry.name.endsWith(".test.ts") &&
          !["cli.ts", "patchEmbedLibs.ts", "utils.ts"].includes(entry.name),
      )
      .map((entry) => `src/${entry.name}`);

    for (const script of operationalScripts)
      expect(exposedEntryPoints).toContain(script);
  });

  it("selects production environment files through Nx", () => {
    for (const [target, command] of Object.entries(packageJson.scripts)) {
      if (!command.includes("run:prod:mysql")) continue;

      expect(packageJson.nx.targets[target]?.defaultConfiguration).toBe(
        "production",
      );
      expect(
        packageJson.nx.targets[target]?.configurations?.production,
      ).toBeDefined();
    }

    expect(packageJson.scripts["run:prod:mysql"]).not.toContain("dotenv");
    expect(packageJson.nx.targets["run:prod:mysql"]?.defaultConfiguration).toBe(
      "production",
    );
  });

  it("centralizes prompts so missing off-TTY values cannot hang", () => {
    for (const fileName of readdirSync(join(scriptsRoot, "src"))) {
      if (
        !fileName.endsWith(".ts") ||
        fileName.endsWith(".test.ts") ||
        fileName === "cli.ts"
      )
        continue;
      expect(
        readFileSync(join(scriptsRoot, "src", fileName), "utf8"),
      ).not.toContain("@clack/prompts");
    }
  });

  it("keeps an explicit confirmation gate on destructive entry points", () => {
    for (const fileName of destructiveEntryPoints) {
      const source = readFileSync(join(scriptsRoot, "src", fileName), "utf8");
      expect(`${basename(fileName)}:${source}`).toContain("confirmAction");
    }

    expect(
      readFileSync(join(scriptsRoot, "src/sendEmailCampaign.ts"), "utf8"),
    ).toContain('process.env.SEND_EMAILS === "true"');
    expect(
      readFileSync(join(scriptsRoot, "src/helpers/destroyUser.ts"), "utf8"),
    ).toContain("confirmAction");
  });
});

const destructiveEntryPoints = [
  "addHttpProxyCredentials.ts",
  "blockTypebot.ts",
  "bulkUpdate.ts",
  "createChatsPrices.ts",
  "deleteChatSession.ts",
  "deleteResultsRange.ts",
  "deleteS3Object.ts",
  "insertUsersInBrevoList.ts",
  "migrateSubscriptionItemPriceId.ts",
  "migrateSubscriptionsToUsageBased.ts",
  "readCsvAndDoSomething.ts",
  "redeemCoupon.ts",
  "restoreDatabase.ts",
  "suspendWorkspace.ts",
  "updateTypebot.ts",
  "updateUserEmail.ts",
  "updateWhatsAppStatusForwardUrl.ts",
  "updateWorkspace.ts",
];
