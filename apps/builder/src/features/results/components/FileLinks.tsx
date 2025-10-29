import { FileEmpty02Icon } from "@typebot.io/ui/icons/FileEmpty02Icon";
import { TextLink } from "@/components/TextLink";

export const FileLinks = ({ fileNamesStr }: { fileNamesStr: string }) => {
  const fileNames = fileNamesStr.split(", ");
  return (
    <div className="flex flex-wrap max-w-[300px]">
      {fileNames.map((name) => (
        <div className="flex items-center gap-2" key={name}>
          <FileEmpty02Icon />
          <TextLink href={name} isExternal>
            {decodeURIComponent(name.split("/").pop() ?? "")}
          </TextLink>
        </div>
      ))}
    </div>
  );
};
