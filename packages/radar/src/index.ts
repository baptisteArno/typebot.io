import { env } from "@typebot.io/env";

type Params = {
  debug: boolean;
};

export const computeRiskLevel = (typebot: any, params?: Params) => {
  const stringifiedTypebot = JSON.stringify(typebot);
  if (
    env.RADAR_HIGH_RISK_KEYWORDS?.some((keyword) =>
      new RegExp(
        `(?<!(https?://|@)[^\\s"]*)\\b${keyword}${
          keyword.includes("$") ? "" : "\\b"
        }`,
        "gi",
      ).test(stringifiedTypebot),
    )
  ) {
    if (params?.debug) {
      console.log(
        "High risk keywords detected:",
        env.RADAR_HIGH_RISK_KEYWORDS?.find((keyword) =>
          new RegExp(
            `(?<!(https?://|@)[^\\s"]*)\\b${keyword}${
              keyword.includes("$") ? "" : "\\b"
            }`,
            "gi",
          ).test(stringifiedTypebot),
        ),
      );
    }
    return 100;
  }

  if (
    env.RADAR_CUMULATIVE_KEYWORDS?.some((set) =>
      set.every((keyword) =>
        keyword.some((k) =>
          new RegExp(
            `(?<!(https?://|@)[^\\s"]*)\\b${k}${k.includes("$") ? "" : "\\b"}`,
            "gi",
          ).test(stringifiedTypebot),
        ),
      ),
    )
  ) {
    if (params?.debug) {
      console.log(
        "Cumulative keywords detected:",
        env.RADAR_CUMULATIVE_KEYWORDS?.find((set) =>
          set.every((keyword) =>
            keyword.some((k) =>
              new RegExp(
                `(?<!(https?://|@)[^\\s"]*)\\b${k}${
                  k.includes("$") ? "" : "\\b"
                }`,
                "gi",
              ).test(stringifiedTypebot),
            ),
          ),
        ),
      );
    }
    return 100;
  }
  if (
    env.RADAR_INTERMEDIATE_RISK_KEYWORDS?.some((keyword) =>
      stringifiedTypebot.toLowerCase().includes(keyword),
    )
  )
    return 50;
  return 0;
};
