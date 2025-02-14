import { Toast, type ToastProps } from "@/components/Toast";
import { toast as sonnerToast } from "sonner";

export const toast = (props: Omit<ToastProps, "id">) => {
  return sonnerToast.custom((id) => <Toast id={id} {...props} />, {
    duration: props.details ? 30000 : undefined,
  });
};
