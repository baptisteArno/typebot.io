import { Button } from "@typebot.io/ui/components/Button";
import { Progress } from "@typebot.io/ui/components/Progress";
import { Download01Icon } from "@typebot.io/ui/icons/Download01Icon";
import { FileEmpty02Icon } from "@typebot.io/ui/icons/FileEmpty02Icon";

type Props = {
  data: any;
  error: any;
};
export const ExportJobProgress = ({ data, error }: Props) => {
  if (error) {
    return (
      <div className="flex items-center gap-2 bg-card rounded-md p-4 border justify-between">
        Error exporting results: {error.message}
      </div>
    );
  }
  if (data?.status === "complete") {
    return (
      <div className="flex items-center gap-2 bg-card rounded-md p-4 border justify-between">
        <div className="flex gap-2">
          <FileEmpty02Icon className="mt-1 size-5" />
          <p className="text-sm mr-4">{data?.fileName}</p>
        </div>
        <Button
          size="icon"
          onClick={() => {
            window.open(data?.fileUrl, "_blank");
          }}
        >
          <Download01Icon />
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p>Exporting results...</p>
      <Progress.Root value={data?.progress ?? 0} />
    </div>
  );
};
