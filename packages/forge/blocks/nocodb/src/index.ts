import { createBlock } from "@typebot.io/forge";
import { createRecord } from "./actions/createRecord";
import { searchRecords } from "./actions/searchRecords";
import { updateExistingRecord } from "./actions/updateExistingRecord";
import { auth } from "./auth";
import { NocodbLogo } from "./logo";

export const nocodbBlock = createBlock({
  id: "nocodb",
  name: "NocoDB",
  docsUrl: "https://docs.typebot.io/forge/blocks/nocodb",
  tags: ["database"],
  LightLogo: NocodbLogo,
  auth,
  actions: [searchRecords, createRecord, updateExistingRecord],
  onboarding: {
    youtubeId: "ViKETDQ8Sfg",
    deployedAt: new Date("2023-06-20"),
  },
});
