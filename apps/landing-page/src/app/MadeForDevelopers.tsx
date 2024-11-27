import { CodeIcon } from "@typebot.io/ui/icons/CodeIcon";
import { GithubIcon } from "@typebot.io/ui/icons/GithubIcon";
import { RulerIcon } from "@typebot.io/ui/icons/RulerIcon";
import { SparklesIcon } from "@typebot.io/ui/icons/SparklesIcon";
import { ZapIcon } from "@typebot.io/ui/icons/ZapIcon";
import Link from "next/link";
import { githubRepoUrl } from "./constants";

const data = [
  {
    Icon: RulerIcon,
    text: "100% open source. No vendor-locking",
  },
  {
    Icon: CodeIcon,
    text: "Easy-to-use APIs",
  },
  {
    Icon: SparklesIcon,
    text: "Multiple generative AI providers (OpenAI, Anthropic, Mistral…)",
  },
  {
    Icon: ZapIcon,
    text: "Fast, reliable, and scalable",
  },
];

export const MadeForDevelopers = () => {
  return (
    <div className="flex flex-col items-center gap-12 px-4 py-20">
      <div className="flex flex-col gap-4 items-center">
        <h2 className="text-4xl text-center">
          Built for everyone, made for developers
        </h2>
        <div className="flex items-center gap-3">
          <GithubIcon className="size-4" />
          <Link
            target="_blank"
            href={githubRepoUrl}
            className="font-medium underline"
          >
            See Github repository
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {data.map(({ Icon, text }, index) => (
          <div key={index} className="flex items-start gap-3">
            <Icon className="size-4 mt-1" />
            <p className="max-w-44">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
