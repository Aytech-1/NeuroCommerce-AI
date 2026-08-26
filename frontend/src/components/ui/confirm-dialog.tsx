"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Trash2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "default" | "info" | "warning" | "danger" | "success";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  warningNotice?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<
  ConfirmVariant,
  {
    iconBg: string;
    iconColor: string;
    IconComponent: React.ElementType;
    confirmButtonVariant: "primary" | "secondary" | "destructive" | "success";
  }
> = {
  default: {
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    IconComponent: HelpCircle,
    confirmButtonVariant: "primary",
  },
  info: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    IconComponent: Info,
    confirmButtonVariant: "primary",
  },
  warning: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    IconComponent: AlertTriangle,
    confirmButtonVariant: "primary",
  },
  danger: {
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    IconComponent: Trash2,
    confirmButtonVariant: "destructive",
  },
  success: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    IconComponent: CheckCircle2,
    confirmButtonVariant: "success",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
  warningNotice,
  icon,
}: ConfirmDialogProps) {
  const currentVariant = variantStyles[variant] || variantStyles.default;
  const VariantIcon = currentVariant.IconComponent;

  const handleCancel = () => {
    if (isLoading) return;
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => (!isLoading ? onOpenChange(val) : null)}>
      <DialogContent className="max-w-md p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xl space-y-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-100",
              currentVariant.iconBg,
              currentVariant.iconColor
            )}
          >
            {icon ? icon : <VariantIcon className="h-5 w-5" aria-hidden="true" />}
          </div>

          <div className="space-y-1 min-w-0 pr-4">
            <DialogTitle className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </div>

        {warningNotice && (
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="leading-relaxed font-medium">{warningNotice}</span>
          </div>
        )}

        <DialogFooter className="pt-2 sm:space-x-3 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-11 px-5 text-xs font-bold w-full sm:w-auto"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={currentVariant.confirmButtonVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            className="h-11 px-5 text-xs font-bold w-full sm:w-auto shadow-xs"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
