import { toast } from "@/lib/toast";
import { chakra } from "@chakra-ui/react";
import { parseUnknownClientError } from "@typebot.io/lib/parseUnknownClientError";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import {
  type ButtonProps,
  buttonVariants,
} from "@typebot.io/ui/components/Button";
import { cn } from "@typebot.io/ui/lib/cn";
import React, { type ChangeEvent } from "react";

type Props = {
  onNewTypebot: (typebot: Typebot) => void;
} & ButtonProps;

export const ImportTypebotFromFileButton = ({
  onNewTypebot,
  variant,
  size,
  ...props
}: Props) => {
  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return;
    const file = e.target.files[0];
    const fileContent = await readFile(file);
    try {
      const typebot = JSON.parse(fileContent);
      onNewTypebot({
        ...typebot,
        events: typebot.events ?? null,
        icon: typebot.icon ?? null,
        name: typebot.name ?? "My typebot",
      } as Typebot);
    } catch (err) {
      console.error(err);
      toast(await parseUnknownClientError({ err }));
    }
  };

  return (
    <>
      <chakra.input
        type="file"
        id="file-input"
        display="none"
        onChange={handleInputChange}
        accept=".json"
      />
      <label
        htmlFor="file-input"
        className={cn(buttonVariants({ variant, size }), props.className)}
      >
        {props.children}
      </label>
    </>
  );
};

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      fr.result && resolve(fr.result.toString());
    };
    fr.onerror = reject;
    fr.readAsText(file);
  });
};
