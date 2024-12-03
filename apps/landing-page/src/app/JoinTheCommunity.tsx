import { Button, buttonVariants } from "@/components/button";
import Link from "next/link";
import { discordUrl } from "./constants";

const data = [
  {
    stat: "2M+",
    label: "monthly chats",
  },
  {
    stat: "1.5M+",
    label: "bots published",
  },
  {
    stat: "3,000+",
    label: "members on Discord",
  },
];

export const JoinTheCommunity = () => (
  <div className="flex flex-col bg-gray-1 rounded-2xl gap-4">
    <div className="flex flex-col gap-12 dark rounded-2xl p-6 pt-12">
      <div className="flex flex-col gap-4">
        <h2 className="text-4xl text-center text-gray-12">
          Together, we&apos;re hacking the future of conversational AI apps
        </h2>
        <p className="text-gray-11 text-center">
          Join the Typebot community to connect with chatbot enthusiasts, share
          insights, and learn together to create advanced automations. Get
          exclusive resources, influence product development, and be part of a
          network that's shaping the future of conversational apps.
        </p>
      </div>
      <Button
        variant="cta"
        size="lg"
        render={<Link href={discordUrl} target="_blank" />}
      >
        Join the community
      </Button>
    </div>
    <div className="flex flex-col gap-6 p-4">
      {data.map(({ stat, label }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <span className="text-4xl font-heading font-medium">{stat}</span>
          <span className="text-gray-11">{label}</span>
        </div>
      ))}
    </div>
  </div>
);
