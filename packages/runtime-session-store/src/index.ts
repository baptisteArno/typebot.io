import { Isolate } from "isolated-vm";

let lastCleanupTime = new Date();
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

export class SessionStore {
  private isolate: Isolate | undefined;
  private emailSendingCount: number;
  private prevHash: string | undefined;
  private createdAt: Date;

  constructor() {
    this.isolate = undefined;
    this.emailSendingCount = 0;
    this.prevHash = undefined;
    this.createdAt = new Date();
  }

  getEmailSendingCount(): number {
    return this.emailSendingCount;
  }

  incrementEmailSendingCount(): void {
    this.emailSendingCount += 1;
  }

  getPrevHash(): string | undefined {
    return this.prevHash;
  }

  setPrevHash(hash: string): void {
    this.prevHash = hash;
  }

  getOrCreateIsolate(): Isolate {
    if (!this.isolate) this.isolate = new Isolate();
    return this.isolate;
  }

  dispose(): void {
    if (this.isolate) {
      this.isolate.dispose();
      this.isolate = undefined;
    }
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}

export const sessionStores = new Map<string, SessionStore>();

export const getSessionStore = (sessionId: string): SessionStore => {
  const now = new Date();

  if (now.getTime() - lastCleanupTime.getTime() > CLEANUP_INTERVAL_MS) {
    cleanupOldSessionStores();
    lastCleanupTime = now;
  }

  if (!sessionStores.has(sessionId)) {
    sessionStores.set(sessionId, new SessionStore());
  }
  return sessionStores.get(sessionId)!;
};

export const deleteSessionStore = (sessionId: string | undefined): void => {
  if (!sessionId) return;
  const store = sessionStores.get(sessionId);
  if (store) {
    store.dispose();
    sessionStores.delete(sessionId);
  }
};

// In theory we always remove the session stores once it was used but in case we forget somewhere, we run this cleanup every 30 minutes at most
const cleanupOldSessionStores = (maxAgeDays = 3) => {
  const now = new Date();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  for (const [sessionId, store] of sessionStores.entries()) {
    const storeAge = now.getTime() - store.getCreatedAt().getTime();
    if (storeAge > maxAgeMs) {
      store.dispose();
      sessionStores.delete(sessionId);
    }
  }
};
