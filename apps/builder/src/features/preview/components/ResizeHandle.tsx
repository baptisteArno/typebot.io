import { cn } from "@typebot.io/ui/lib/cn";

export const ResizeHandle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex w-[15px] h-[50px] border justify-center items-center rounded-sm cursor-col-resize bg-gray-1",
        className,
      )}
      {...props}
    >
      <div className="w-[2px] h-[70%] mr-0.5 bg-gray-8" />
      <div className="w-[2px] h-[70%] bg-gray-8" />
    </div>
  );
};
