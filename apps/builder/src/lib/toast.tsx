import { Toast, type ToastProps } from "@/components/Toast";
import { toast as sonnerToast } from "sonner";

export const toast = ({
  details,
  ...props
}: Omit<ToastProps, "id" | "details"> & { details?: string | null }) => {
  const parsedDetails = details ? parseStrDetails(details) : undefined;
  return sonnerToast.custom(
    (id) => <Toast id={id} {...props} details={parsedDetails} />,
    {
      duration: props.action
        ? 60000
        : details
          ? 30000
          : (props.status ?? "error") === "error"
            ? 8000
            : undefined,
    },
  );
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
