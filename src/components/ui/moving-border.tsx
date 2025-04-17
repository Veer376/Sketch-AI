import React, { useRef } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  borderRadius?: string;
  children?: React.ReactNode;
  className?: string;
  duration?: number;
  animate?: boolean;
}

export const Button = ({
  borderRadius = "1.75rem",
  children,
  className,
  duration = 10000000, // Increased from 4000 to 8000 ms to slow down the animation
  animate = false, // Default to false, will be true when processing
  ...props
}: ButtonProps) => {
  const animationRef = useRef<HTMLDivElement>(null);

  return (
    <button
      className={cn(
        "relative z-0 overflow-hidden rounded-md border-0 bg-white px-4 py-2 font-medium text-black transition-colors dark:bg-slate-900 dark:text-white",
        className
      )}
      style={{ borderRadius }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      
      {/* Gradient border container - always visible but animation controlled by animate prop */}
      <div
        ref={animationRef}
        className={cn(
          "absolute inset-0 z-0",
          animate ? "animate-snake-border" : "static-gradient-border"
        )}
        style={{
          animationDuration: animate ? `${duration}ms` : "0ms",
          borderRadius,
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: "transparent",
          backgroundOrigin: "border-box",
          backgroundClip: "border-box",
          // When not animating, use a fixed gradient
          background: animate ? undefined : "linear-gradient(90deg, #8e2de2, #4a00e0, #3f51b5, #00bcd4) border-box"
        }}
      />
      
      {/* Inner background */}
      <div
        className="absolute inset-[2px] z-0 rounded-md bg-white dark:bg-slate-900"
        style={{ borderRadius: `calc(${borderRadius} - 2px)` }}
      />
    </button>
  );
};