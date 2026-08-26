"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingState } from "@/components/ui/loading-state";

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return <LoadingState message="Verifying authentication session..." className="min-h-screen" />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md">
          You do not have the required role ({requiredRole}) to view this section.
        </p>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Permission Denied</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md">
          Your account is missing the required permission: <code>{requiredPermission}</code>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
