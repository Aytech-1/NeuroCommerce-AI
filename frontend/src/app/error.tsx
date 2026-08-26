"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Container } from "@/components/ui/container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring telemetry
    console.error("Global boundary caught application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Container size="sm">
        <ErrorState
          title="Application Encountered an Error"
          message={error.message || "An unexpected error occurred while rendering the page."}
          onRetry={reset}
        />
      </Container>
    </div>
  );
}
