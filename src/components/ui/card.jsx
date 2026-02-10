import React from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm", className)} {...props} />;
}
export function CardHeader({ className, ...props }) {
  return <div className={cn("p-5 border-b border-gray-100", className)} {...props} />;
}
export function CardTitle({ className, ...props }) {
  return <div className={cn("text-base md:text-lg font-bold text-gray-900", className)} {...props} />;
}
export function CardDescription({ className, ...props }) {
  return <div className={cn("text-sm text-gray-500 mt-1", className)} {...props} />;
}
export function CardContent({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}
