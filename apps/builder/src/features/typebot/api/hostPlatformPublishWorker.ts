import { handlePublishTypebot } from "./handlePublishTypebot";

const main = async () => {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk.toString();
  const { typebotId, userId } = JSON.parse(raw) as {
    typebotId: string;
    userId: string;
  };
  const result = await handlePublishTypebot({
    input: { typebotId },
    context: { user: { id: userId } },
  });
  process.stdout.write(JSON.stringify(result));
};

void main();
