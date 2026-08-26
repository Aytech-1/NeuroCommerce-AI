import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[250px] flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <Spinner size="lg" className="text-indigo-600 dark:text-indigo-400 mb-4" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
