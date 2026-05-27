import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Page() {
  const { query } = useRouter();

  useEffect(() => {
    const code = typeof query.code === "string" ? query.code : undefined;
    const error = typeof query.error === "string" ? query.error : undefined;
    const state = typeof query.state === "string" ? query.state : undefined;

    if (!code && !error) return;
    window.opener?.postMessage(
      { type: "oauth", code, error, state },
      window.location.origin,
    );
    window.close();
  }, [query]);

  return <div>Redirecting...</div>;
}
