import React from "react";
import { cn } from "../../lib/utils";

export function Label({ className, ...props }) {
  return <label className={cn("text-xs font-semibold text-gray-600", className)} {...props} />;
}
