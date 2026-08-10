import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "small" | "medium" | "large";
}

export function Button({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`aio-button aio-button-${variant} aio-button-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}