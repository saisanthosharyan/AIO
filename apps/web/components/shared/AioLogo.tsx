interface AioLogoProps {
  showName?: boolean;
  size?: "small" | "medium" | "large";
}

export default function AioLogo({
  showName = true,
  size = "medium",
}: AioLogoProps) {
  return (
    <div className={`aio-logo aio-logo-${size}`}>
      <div className="brand-mark">
        <span />
        <span />
        <span />
      </div>

      {showName && <span className="brand-name">AIO</span>}
    </div>
  );
}