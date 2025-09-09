import { Card } from "@/components/Card";
import editorMockupSrc from "./assets/editor-mockup.png";
import publishClickSrc from "./assets/publish-click.png";
import signUpButtonSrc from "./assets/signup-button.png";

const _imagesBasePath = "/images/sections/get-started";

const instructions = [
  {
    image: {
      src: signUpButtonSrc,
      alt: "A button in the center with label 'Sign up'",
    },
    title: "Step 1",
    description:
      "Create your account and choose your plan—you can sign up for a risk-free trial",
  },
  {
    image: {
      src: editorMockupSrc,
      alt: "A mockup of a chatbot editor interface",
    },
    title: "Step 2",
    description: "Pick a template from our library or start from scratch.",
  },
  {
    image: {
      src: publishClickSrc,
      alt: "A mouse over a 'Publish' button",
    },
    title: "Step 3",
    description:
      "Build and test your chat in real-time. Ready to launch? Just click publish!",
  },
];

export const GetStarted = () => {
  return (
    <div className="flex flex-col gap-8">
      <h2>Get started with Typebot</h2>
      <div className="flex flex-col md:flex-row max-w-7xl gap-2">
        {instructions.map((instruction) => (
          <InstructionCard
            key={instruction.title}
            image={instruction.image}
            title={instruction.title}
            description={instruction.description}
          />
        ))}
      </div>
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
        <h3 className="uppercase font-bold text-lg">{title}</h3>
        <p>{description}</p>
      </div>
    </Card>
  );
};
