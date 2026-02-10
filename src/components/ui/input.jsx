import React from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none",
        "focus:ring-4 focus:ring-gray-900/10 focus:border-gray-300",
        className
      )}
      {...props}
    />
  );
}
