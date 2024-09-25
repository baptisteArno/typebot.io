import { useTranslate } from "@tolgee/react";

export const useTimeSince = (date?: string) => {
  const { t } = useTranslate();

  if (!date) return;

  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  );

  let interval = seconds / 31536000;

  if (interval > 1) {
    return t("timeSince.years", { count: Math.floor(interval) });
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return t("timeSince.months", { count: Math.floor(interval) });
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return t("timeSince.days", { count: Math.floor(interval) });
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return t("timeSince.hours", { count: Math.floor(interval) });
  }
  interval = seconds / 60;
  if (interval > 1) {
    return t("timeSince.minutes", { count: Math.floor(interval) });
  }
  return t("timeSince.seconds", { count: Math.floor(interval) });
};
