export type FamulorList<T> = {
  data?: T[];
  meta?: {
    pagination?: {
      total?: number;
    };
  };
};

export type FamulorEnvelope<T> = {
  data?: T;
};

export type FamulorCall = {
  id?: string;
  status?: string | null;
  summary?: string | null;
  duration_sec?: number | null;
  recording_url?: string | null;
  structured_transcript?: string | null;
  transcript?: unknown;
};

export type FamulorAssistant = {
  id?: string;
  name?: string | null;
  is_active?: boolean;
};

export type FamulorPhoneNumber = {
  id?: string;
  number?: string | null;
  direction_outbound?: boolean;
};
