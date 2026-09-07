"use client";

import {
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface AuthGuardProps {
  children: ReactNode;
}

function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): boolean {
  return Boolean(localStorage.getItem("aio_token"));
}

function getServerSnapshot(): boolean {
  return true;
}

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const authenticated = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!authenticated) {
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }

    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <p>Redirecting to login...</p>
      </main>
    );
  }

  return <>{children}</>;
}
