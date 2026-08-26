import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, prefixIcon, suffixIcon, value, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {prefixIcon && <div className="absolute left-3.5 text-slate-400 pointer-events-none">{prefixIcon}</div>}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 hover:border-slate-300 transition-all shadow-2xs",
            prefixIcon && "pl-10",
            suffixIcon && "pr-10",
            error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/15",
            className
          )}
          ref={ref}
          value={value ?? ""}
          {...props}
        />
        {suffixIcon && <div className="absolute right-3.5 text-slate-400 pointer-events-none">{suffixIcon}</div>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
