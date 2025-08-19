import {
  type AddToastOptions,
  Toast,
  type ToastType,
} from "@typebot.io/ui/components/Toast";

export const toastManager = Toast.createToastManager();

export const toast = (
  props: Omit<AddToastOptions, "type"> & {
    details?: string;
    type?: ToastType;
  },
) => {
  const parsedDetails = props.details
    ? parseStrDetails(props.details)
    : undefined;
  return toastManager.add({
    ...props,
    timeout: props.actionProps
      ? 60000
      : props.details
        ? 30000
        : (props.type ?? "error") === "error"
          ? 8000
          : 5000,
    priority: (props.type ?? "error") === "error" ? "high" : "low",
    data: {
      details: parsedDetails,
    },
  });
};

const parseStrDetails = (
  details: string,
): { lang: "shell" | "json"; content: string } => {
  try {
    let parsed = JSON.parse(details);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    return { lang: "json", content: JSON.stringify(parsed, null, 2) };
  } catch (error) {
    return { lang: "shell", content: details };
  }
};
