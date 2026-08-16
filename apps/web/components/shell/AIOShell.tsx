"use client";

import type { ReactNode } from "react";

import Sidebar from "../navigation/Sidebar";
import TopBar from "../navigation/TopBar";

interface AIOShellProps {
  children: ReactNode;
}

export default function AIOShell({ children }: AIOShellProps) {
  return (
    <div className="aio-shell">
      <TopBar />

      <div className="aio-body">
        <Sidebar />

        <main className="aio-workspace">
          <div className="aio-workspace-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}