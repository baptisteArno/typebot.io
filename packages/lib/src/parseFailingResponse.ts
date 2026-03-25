type ParsedResponse = {
  context?: string;
  description: string;
  details?: string;
};

export const parseFailingResponse = async (
  response: Response,
  { context }: { context?: string } = {},
): Promise<ParsedResponse> => {
  const text = await response.text();
  try {
    const body = JSON.parse(text);
    if (typeof body === "object" && body && "message" in body)
      return {
        context: body.context ?? context,
        description: body.message,
        details: body.details,
      };
  } catch {
    // Not JSON
  }
  return {
    context,
    description: text || `Request failed with status ${response.status}`,
  };
};
