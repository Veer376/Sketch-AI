import React from "react";
import { cn } from "../../utils/cn"; // We'll create this utility function

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  borderRadius?: string;
  children?: React.ReactNode;
  className?: string;
  duration?: number;
}

export const Button = ({
  borderRadius = "1.75rem",
  children,
  className,
  duration = 2000,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "relative z-0 overflow-hidden rounded-md border border-neutral-200 bg-white px-4 py-2 font-medium text-black transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-white",
        className
      )}
      style={{ borderRadius }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div
        className="absolute inset-0 z-0 h-full w-full animate-[spin_4s_linear_infinite] bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500"
        style={{
          animationDuration: `${duration}ms`,
        }}
      />
      <div
        className="absolute inset-0.5 z-0 rounded-md bg-white dark:bg-slate-900"
        style={{ borderRadius: `calc(${borderRadius} - 2px)` }}
      />
    </button>
  );
};