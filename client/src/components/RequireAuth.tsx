import React, { useEffect, useState } from "react";
import { auth } from "@/lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const u = auth.currentUser();
    setOk(!!u);
    setReady(true);
    const unsub = auth.on("login", () => window.location.reload());
    return () => { unsub && (unsub as any)(); };
  }, []);

  if (!ready) return null;
  if (!ok) {
    window.location.href = "/auth";
    return null;
  }
  return <>{children}</>;
}
