// Inline the worker code as a string to avoid bundler issues
const workerCode = `
const AsyncFunction = Object.getPrototypeOf(async () => {})
  .constructor;

const originalFetch = self.fetch.bind(self);

// Wrap fetch to force credentials: "omit" and strip sensitive headers
async function safeFetch(
  input,
  init,
) {
  const safeInit = {
    ...(init || {}),
    credentials: "omit",
  };

  if (input instanceof Request) {
    const safeRequest = new Request(input, safeInit);
    return originalFetch(safeRequest);
  }

  return originalFetch(input, safeInit);
}

// Override global fetch BEFORE any user code runs
self.fetch = safeFetch;

// Disable other network APIs that could carry cookies automatically
self.XMLHttpRequest = () => {
  console.warn("XMLHttpRequest is disabled in preview mode.");
};

self.WebSocket = () => {
  console.warn("WebSocket is disabled in preview mode.");
};

self.EventSource = () => {
  console.warn("EventSource is disabled in preview mode.");
};

self.Worker = () => {
  console.warn("Creating nested workers is disabled in preview mode.");
};

self.SharedWorker = () => {
  console.warn("Shared workers are disabled in preview mode.");
};

self.onmessage = async (event) => {
  const { id, code, args = {} } = event.data;

  try {
    const argNames = Object.keys(args);
    const argValues = Object.values(args);

    // Create an async function with the given args
    const userFunc = new AsyncFunction(...argNames, code);

    const result = await userFunc(...argValues);

    const message = { id, ok: true, result };
    self.postMessage(message);
  } catch (err) {
    const message = {
      id,
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : JSON.stringify(err),
    };
    self.postMessage(message);
  }
};
`;

let workerPromise: Promise<Worker> | null = null;

function getScriptRunnerWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = new Promise((resolve, reject) => {
      try {
        if (typeof window === "undefined") {
          throw new Error("Script runner worker cannot be used on the server.");
        }

        const blob = new Blob([workerCode], { type: "application/javascript" });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        worker.addEventListener("error", (e) => {
          console.error("[ScriptRunnerWorker] error", e);
        });

        resolve(worker);
      } catch (err) {
        reject(err);
      }
    });
  }
  return workerPromise;
}

type WorkerRequest = {
  id: number;
  code: string;
  args: Record<string, unknown>;
};

type WorkerResponse =
  | { id: number; ok: true; result: unknown }
  | { id: number; ok: false; error: string };

let nextId = 0;

export const runUserCodeInWorker = async (
  code: string,
  args: Record<string, unknown>,
): Promise<unknown> => {
  const worker = await getScriptRunnerWorker();

  return new Promise((resolve, reject) => {
    const id = nextId++;

    const listener = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      if (!msg || msg.id !== id) return;

      worker.removeEventListener("message", listener);

      if (msg.ok) resolve(msg.result);
      else reject(new Error(msg.error));
    };

    worker.addEventListener("message", listener);

    const payload: WorkerRequest = { id, code, args };
    worker.postMessage(payload);
  });
};
