import { Toast as ToastPrimitive } from "@base-ui-components/react/toast";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/react";
import { z } from "@typebot.io/zod";
import { CheckmarkSquareIcon } from "../icons/CheckmarkSquareIcon";
import { CloseIcon } from "../icons/CloseIcon";
import { InfoIcon } from "../icons/InfoIcon";
import { TriangleAlertIcon } from "../icons/TriangleAlertIcon";
import { cn } from "../lib/cn";
import { Button, buttonVariants } from "./Button";

const List = ({
  className,
  CodeEditor,
  ...props
}: ToastPrimitive.Viewport.Props & {
  CodeEditor: ({
    isReadOnly,
    value,
    lang,
    minWidth,
    maxHeight,
    maxWidth,
  }: {
    isReadOnly: boolean;
    value: string;
    lang: "shell" | "json";
    minWidth: string;
    maxHeight: string;
    maxWidth: string;
  }) => JSX.Element;
}) => {
  const { toasts } = ToastPrimitive.useToastManager();

  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        {...props}
        className={cn(
          // TODO: z-index is necessary here because toast portal is kept mounted at all times
          "fixed top-auto right-[1rem] bottom-[1rem] mx-auto flex w-[250px] sm:right-[2rem] sm:bottom-[2rem] sm:w-96 z-10",
          className,
        )}
      >
        {toasts.map((toast) => {
          const data = toastDataSchema.optional().parse(toast.data);

          return (
            <ToastPrimitive.Root
              key={toast.id}
              toast={toast}
              className={cn(
                "absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+calc(min(var(--toast-index),10)*-15px)))_scale(calc(max(0,1-(var(--toast-index)*0.1))))] rounded-lg border bg-gray-1 bg-clip-padding p-4 shadow-lg transition-all [transition-property:opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] select-none after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
                "duration-300 data-[ending-style]:opacity-0 data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y)))] data-[limited]:opacity-0 data-[starting-style]:[transform:translateY(150%)] data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-[ending-style]:[&:not([data-limited])]:[transform:translateY(150%)]",
                data?.details ? "w-full" : "w-[300px]",
                className,
              )}
              style={{
                ["--gap" as string]: "1rem",
                ["--offset-y" as string]:
                  "calc(var(--toast-offset-y) * -1 + (var(--toast-index) * var(--gap) * -1) + var(--toast-swipe-movement-y))",
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                  <ToastIcon
                    type={toast.type}
                    className={
                      !toast.title || !toast.description ? "size-4" : "size-5"
                    }
                  />
                  <div className="flex flex-1 flex-col gap-2 justify-center h-full">
                    <div className="flex flex-col gap-0.5">
                      <ToastPrimitive.Title className="text-base pr-5" />
                      <ToastPrimitive.Description />
                    </div>
                    {toast.actionProps && (
                      <div className="flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          {...toast.actionProps}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {toast.data.details && (
                  <Accordion allowToggle>
                    <AccordionItem onPointerDown={(e) => e.stopPropagation()}>
                      <AccordionButton
                        justifyContent="space-between"
                        fontSize="sm"
                        py="1"
                      >
                        Details
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel>
                        <CodeEditor
                          isReadOnly
                          value={toast.data.details.content}
                          lang={toast.data.details.lang}
                          minWidth="300px"
                          maxHeight="200px"
                          maxWidth="calc(450px - 100px)"
                        />
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>

              <ToastPrimitive.Close
                className={cn(
                  buttonVariants({ variant: "secondary", size: "icon" }),
                  "absolute top-2 right-2 size-6",
                )}
                aria-label="Close"
              >
                <CloseIcon />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  );
};

const toastDataSchema = z.object({
  details: z
    .object({
      lang: z.enum(["shell", "json"]),
      content: z.string(),
    })
    .optional(),
});
type ToastData = z.infer<typeof toastDataSchema>;

const ToastIcon = ({
  type,
  className,
  ...props
}: {
  type?: string;
} & React.SVGProps<SVGSVGElement>) => {
  switch (type) {
    case "success":
      return (
        <div className="flex justify-center bg-green-5 p-1.5 rounded-full">
          <CheckmarkSquareIcon
            {...props}
            className={cn("size-5 text-green-11", className)}
          />
        </div>
      );
    case "info":
      return (
        <div className="flex items-center justify-center bg-blue-5 p-1.5 rounded-full">
          <InfoIcon
            {...props}
            className={cn("size-5 text-blue-11", className)}
          />
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center bg-red-5 p-1.5 rounded-full">
          <TriangleAlertIcon
            {...props}
            className={cn("size-5 text-red-11", className)}
          />
        </div>
      );
  }
};

export const ToastProvider = ToastPrimitive.Provider;

export type AddToastOptions =
  ToastPrimitive.useToastManager.AddOptions<ToastData>;

export type ToastType = "error" | "success" | "info";

export const Toast = {
  List,
  createToastManager: ToastPrimitive.createToastManager,
};
