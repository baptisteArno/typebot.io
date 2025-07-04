import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  HStack,
  IconButton,
  Spinner,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { Button } from "@typebot.io/ui/components/Button";
import { useState } from "react";
import { toast as sonnerToast } from "sonner";
import { AlertIcon, CloseIcon, InfoIcon, SmileIcon } from "./icons";
import { CodeEditor } from "./inputs/CodeEditor";

export type ToastProps = {
  id: string | number;
  context?: string;
  status?: "info" | "error" | "success";
  description: string;
  details?: {
    lang: "shell" | "json";
    content: string;
  };
  action?: {
    label: string;
    onClick: () => Promise<void>;
  };
  icon?: React.ReactNode;
};

export const Toast = ({
  id,
  context,
  status = "error",
  description,
  details,
  action,
  icon,
}: ToastProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const bgColor = useColorModeValue("white", "gray.900");
  const detailsLabelColor = useColorModeValue("gray.600", "gray.400");

  const handleAction = async () => {
    setIsLoading(true);
    await action?.onClick();
    setIsLoading(false);
    sonnerToast.dismiss(id);
  };

  return (
    <Stack
      p={3}
      rounded="md"
      data-theme={useColorMode().colorMode}
      bgColor={bgColor}
      borderWidth="1px"
      shadow="lg"
      fontSize="sm"
      maxW="364px"
      w="full"
      gap={3}
    >
      <HStack pr="7" spacing="3" w="full" flex="1">
        <Icon customIcon={icon} status={status} />{" "}
        <Stack spacing={3} flex="1" justify="center" h="full">
          <Stack spacing={1}>
            {context && <Text fontWeight="medium">{context}</Text>}
            {description && <Text>{description}</Text>}
            {action && (
              <Flex justify="flex-end">
                <Button onClick={handleAction} size="sm" disabled={isLoading}>
                  {isLoading && <Spinner size="xs" />}
                  {action.label}
                </Button>
              </Flex>
            )}
          </Stack>
        </Stack>
      </HStack>
      {details && (
        <Accordion allowToggle>
          <AccordionItem onPointerDown={(e) => e.stopPropagation()}>
            <AccordionButton
              justifyContent="space-between"
              fontSize="sm"
              py="1"
              color={detailsLabelColor}
            >
              Details
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <CodeEditor
                isReadOnly
                value={details.content}
                lang={details.lang}
                minWidth="300px"
                maxHeight="200px"
                maxWidth="calc(450px - 100px)"
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}

      <IconButton
        aria-label="Close"
        icon={<CloseIcon />}
        size="sm"
        onClick={() => sonnerToast.dismiss(id)}
        variant="ghost"
        pos="absolute"
        top={1}
        right={1}
      />
    </Stack>
  );
};

const Icon = ({
  customIcon,
  status,
}: {
  customIcon?: React.ReactNode;
  status: ToastProps["status"];
}) => {
  const color = parseColor(status);
  const icon = parseIcon(status, customIcon);
  return (
    <Flex
      bgColor={`${color}.100`}
      boxSize="32px"
      justifyContent="center"
      alignItems="center"
      rounded="full"
      fontSize="16px"
      color={`${color}.600`}
    >
      {icon}
    </Flex>
  );
};

const parseColor = (status: ToastProps["status"]) => {
  if (!status) return "red";
  switch (status) {
    case "error":
      return "red";
    case "success":
      return "green";
    case "info":
      return "blue";
  }
};

const parseIcon = (
  status: ToastProps["status"],
  customIcon?: React.ReactNode,
) => {
  if (customIcon) return customIcon;
  switch (status) {
    case "error":
      return <AlertIcon />;
    case "success":
      return <SmileIcon />;
    case "info":
      return <InfoIcon />;
  }
};
