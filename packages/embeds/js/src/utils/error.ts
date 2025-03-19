export const isNetworkError = (error: Error) => {
  if (error instanceof TypeError) {
    const networkErrorMessages = [
      "Failed to fetch",
      "NetworkError",
      "Network request failed",
      "Connection refused",
      "ECONNREFUSED",
      "timeout exceeded",
    ];

    return networkErrorMessages.some((message) =>
      error.message.includes(message),
    );
  }

  if (error instanceof DOMException) {
    return error.name === "AbortError" || error.name === "TimeoutError";
  }

  return false;
};
