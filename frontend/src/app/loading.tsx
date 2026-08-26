import { LoadingState } from "@/components/ui/loading-state";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <LoadingState message="Loading NeuroCommerce Platform..." />
    </div>
  );
}
