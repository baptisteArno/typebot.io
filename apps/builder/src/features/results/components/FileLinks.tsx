import { TextLink } from "@/components/TextLink";
import { FileIcon } from "@/components/icons";
import { HStack, Wrap, WrapItem } from "@chakra-ui/react";

export const FileLinks = ({ fileNamesStr }: { fileNamesStr: string }) => {
  const fileNames = fileNamesStr.split(", ");
  return (
    <Wrap maxW="300px">
      {fileNames.map((name) => (
        <HStack as={WrapItem} key={name}>
          <FileIcon />
          <TextLink href={name} isExternal>
            {decodeURIComponent(name.split("/").pop() ?? "")}
          </TextLink>
        </HStack>
      ))}
    </Wrap>
  );
};
