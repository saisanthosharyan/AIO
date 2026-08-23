import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";

interface AioShellProps {
  children: React.ReactNode;
}

export default function AioShell({ children }: AioShellProps) {
  return (
    <div className="aio-app">
      <Sidebar />

      <main className="aio-main">
        {children}
      </main>

      <RightPanel />
    </div>
  );
}