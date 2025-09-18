import type { ReactNode } from "react";
import { cn } from "../libs/utils";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  type?: "submit" | "button";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const variantClasses = {
  primary: "bg-black text-lg text-white px-4 py-2",
  secondary: "border px-2 py-1",
};

export default function Button({
  type = "button",
  variant = "primary",
  className = "",
  onClick = () => {},
  disabled = false,
  children,
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md cursor-pointer",
        variantClasses[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
