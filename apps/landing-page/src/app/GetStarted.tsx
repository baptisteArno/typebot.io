import { Card } from "@/components/card";

const imagesBasePath = "/images/sections/get-started";

const instructions = [
  {
    image: {
      src: `${imagesBasePath}/signup-button.png`,
      alt: "A button in the center with label 'Sign up'",
    },
    title: "Step 1",
    description:
      "Create your account and choose your plan—you can sign up for a risk-free trial",
  },
  {
    image: {
      src: `${imagesBasePath}/editor-mockup.png`,
      alt: "A mockup of a chatbot editor interface",
    },
    title: "Step 2",
    description: "Pick a template from our library or start from scratch.",
  },
  {
    image: {
      src: `${imagesBasePath}/publish-click.png`,
      alt: "A mouse over a 'Publish' button",
    },
    title: "Step 3",
    description:
      "Build and test your chat in real-time. Ready to launch? Just click publish!",
  },
];

export const GetStarted = () => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-4xl text-center">Get started with Typebot</h2>
      {instructions.map((instruction) => (
        <InstructionCard
          key={instruction.title}
          image={instruction.image}
          title={instruction.title}
          description={instruction.description}
        />
      ))}
    </div>
  );
};

const InstructionCard = ({
  image,
  title,
  description,
}: (typeof instructions)[number]) => {
  return (
    <Card className="flex flex-col items-center gap-6 p-1.5 pb-6">
      <img src={image.src} alt={image.alt} className="rounded-xl" />
      <div className="flex flex-col gap-2 px-3">
        <h2 className="font-body uppercase font-bold">{title}</h2>
        <p>{description}</p>
      </div>
    </Card>
  );
};
