import { ExternalLinkIcon } from "@/components/icons";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import {
  Code,
  Link,
  ListItem,
  OrderedList,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { useState } from "react";
import packageJson from "../../../../../../../../../../packages/embeds/js/package.json";
import { StandardSettings } from "../../../settings/StandardSettings";

type Props = {
  publicId: string;
};

export const WordpressStandardInstructions = ({ publicId }: Props) => {
  const [windowSizes, setWindowSizes] = useState<{
    width?: string;
    height: string;
  }>({
    height: "100%",
    width: "100%",
  });

  const elementCode = parseWordpressShortcode({ ...windowSizes, publicId });

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        Install{" "}
        <Link
          href="https://wordpress.org/plugins/typebot/"
          isExternal
          color={useColorModeValue("blue.500", "blue.300")}
        >
          the official Typebot WordPress plugin
          <ExternalLinkIcon mx="2px" />
        </Link>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <StandardSettings
            onUpdateWindowSettings={(sizes) =>
              setWindowSizes({
                height: sizes.heightLabel,
                width: sizes.widthLabel,
              })
            }
          />
          <Text>
            You can now place the following shortcode anywhere on your site:
          </Text>
          <CodeEditor value={elementCode} lang="shell" isReadOnly />
          <Text>
            Note: Your page templating system probably has a{" "}
            <Code>Shortcode</Code> element (if not, use a text element).
          </Text>
        </Stack>
      </ListItem>
    </OrderedList>
  );
};

const parseWordpressShortcode = ({
  width,
  height,
  publicId,
}: {
  width?: string;
  height?: string;
  publicId: string;
}) => {
  return `[typebot typebot="${publicId}"${
    isCloudProdInstance()
      ? ""
      : ` host="${env.NEXT_PUBLIC_VIEWER_URL[0]}" lib_version="${packageJson.version}"`
  }${width ? ` width="${width}"` : ""}${height ? ` height="${height}"` : ""}]
`;
};
