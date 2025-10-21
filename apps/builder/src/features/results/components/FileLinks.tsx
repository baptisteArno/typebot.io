import { HStack, Wrap, WrapItem } from "@chakra-ui/react";
import { FileEmpty02Icon } from "@typebot.io/ui/icons/FileEmpty02Icon";
import { TextLink } from "@/components/TextLink";

export const FileLinks = ({ fileNamesStr }: { fileNamesStr: string }) => {
  const fileNames = fileNamesStr.split(", ");
  return (
    <Wrap maxW="300px">
      {fileNames.map((name) => (
        <HStack as={WrapItem} key={name}>
          <FileEmpty02Icon />
          <TextLink href={name} isExternal>
            {decodeURIComponent(name.split("/").pop() ?? "")}
          </TextLink>
        </HStack>
      ))}
    </Wrap>
  );
};
