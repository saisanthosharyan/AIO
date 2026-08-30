"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("aio_token");

    if (!token) {
      window.location.replace("/login");
      return;
    }

    setChecking(false);
  }, []);

  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <p>Loading AIO...</p>
      </main>
    );
  }

  return <>{children}</>;
}