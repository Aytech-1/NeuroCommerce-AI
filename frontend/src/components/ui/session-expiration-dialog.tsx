"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export function SessionExpirationDialog() {
  const router = useRouter();
  const isSessionExpired = useAuthStore((state) => state.isSessionExpired);
  const logout = useAuthStore((state) => state.logout);

  const handleSignInAgain = () => {
    logout();
    router.push("/login");
  };

  return (
    <Dialog open={isSessionExpired} onOpenChange={() => {}}>
      <DialogContent className="max-w-md p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xl space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </div>

          <div className="space-y-1 min-w-0 pr-4">
            <DialogTitle className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              Your session has expired
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              For your security, your session has expired. Please sign in again to continue accessing your administrative or customer dashboard.
            </DialogDescription>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="primary"
            onClick={handleSignInAgain}
            className="h-11 px-6 text-xs font-bold w-full sm:w-auto shadow-xs"
          >
            Sign In Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
