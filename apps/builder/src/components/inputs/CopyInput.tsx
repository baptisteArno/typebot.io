import { Input } from "@typebot.io/ui/components/Input";
import { CopyButton } from "../CopyButton";

export const CopyInput = ({ value }: { value: string }) => (
  <div className="relative w-full">
    <Input type={"text"} value={value} className="pr-14" />
    <CopyButton
      size="xs"
      textToCopy={value}
      className="absolute right-2 top-1/2 -translate-y-1/2"
    />
  </div>
);
