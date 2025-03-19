export const isNetworkError = (error: Error) => {
  if (error instanceof TypeError) {
    const networkErrorMessages = [
      "Connection refused",
      "Failed to fetch",
      "Failed to load resource",
      "Failed to execute 'fetch' on 'Window'",
      "Load failed",
      "NetworkError",
      "Network request failed",
      "Request failed",
    ];

    const requestErrorMessages = [
      "ERR_INTERNET_DISCONNECTED",
      "ERR_NAME_NOT_RESOLVED",
      "ERR_CONNECTION_REFUSED",
      "ERR_CONNECTION_TIMED_OUT",
      "ERR_SSL_PROTOCOL_ERROR",
    ];

    return [...networkErrorMessages, ...requestErrorMessages].some((message) =>
      error.message.toLowerCase().includes(message.toLowerCase()),
    );
  }

  if (error instanceof DOMException) {
    return error.name === "AbortError" || error.name === "TimeoutError";
  }

  return false;
};
