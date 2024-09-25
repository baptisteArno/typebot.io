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
import { useState } from "react";
import packageJson from "../../../../../../../../../../packages/embeds/js/package.json";
import { PopupSettings } from "../../../settings/PopupSettings";
import { parseApiHostValue } from "../../../snippetParsers";
import { parseInitPopupCode } from "../../../snippetParsers/popup";

const typebotCloudLibraryVersion = "0.2";

type Props = {
  publicId: string;
  customDomain?: string;
};
export const WordpressPopupInstructions = ({
  publicId,
  customDomain,
}: Props) => {
  const [autoShowDelay, setAutoShowDelay] = useState<number>();

  const initCode = parseInitPopupCode({
    typebot: publicId,
    apiHost: parseApiHostValue(customDomain),
    autoShowDelay,
  });

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
        Set <Code>Library version</Code> to{" "}
        <Code>
          {isCloudProdInstance()
            ? typebotCloudLibraryVersion
            : packageJson.version}
        </Code>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <PopupSettings
            onUpdateSettings={(settings) =>
              setAutoShowDelay(settings.autoShowDelay)
            }
          />
          <Text>
            You can now place the following code snippet in the Typebot panel in
            your WordPress admin:
          </Text>
          <CodeEditor value={initCode} lang="javascript" isReadOnly />
        </Stack>
      </ListItem>
    </OrderedList>
  );
};
