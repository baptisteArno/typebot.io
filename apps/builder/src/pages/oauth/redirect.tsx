import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Page() {
  const { query } = useRouter();

  useEffect(() => {
    if (!query.code) return;
    window.opener.postMessage({ type: "oauth", code: query.code }, "*");
    window.close();
  }, [query]);

  return <div>Redirecting...</div>;
}
