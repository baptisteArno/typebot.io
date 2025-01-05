import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { CodeIcon } from "@typebot.io/ui/icons/CodeIcon";
import { GithubIcon } from "@typebot.io/ui/icons/GithubIcon";
import { RulerIcon } from "@typebot.io/ui/icons/RulerIcon";
import { SparklesIcon } from "@typebot.io/ui/icons/SparklesIcon";
import { ZapIcon } from "@typebot.io/ui/icons/ZapIcon";
import { githubRepoUrl } from "../../../constants";

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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:items-center gap-4">
        <h2>Built for everyone, made for developers</h2>
        <div className="flex gap-3 items-center">
          <GithubIcon className="size-4" />
          <Link
            target="_blank"
            href={githubRepoUrl}
            className="font-medium underline"
          >
            See GitHub repository
          </Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        {data.map(({ Icon, text }, index) => (
          <div key={index} className="flex items-start gap-3">
            <Icon className="size-4 mt-1" />
            <p
              className={cn(
                "md:w-44",
                index === data.length - 1 ? undefined : "text-balance",
              )}
            >
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
