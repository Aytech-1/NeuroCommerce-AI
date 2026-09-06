"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PackageCheck,
  Tag,
  Hash,
  Coins,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  ProductVariant,
  CreateVariantPayload,
  UpdateVariantPayload,
} from "@/services/catalog-service";
import {
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from "@/hooks/use-catalog";
import { formatCurrency, getCurrencySymbol } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/types/api";

const variantFormSchema = z.object({
  name: z.string().max(300).optional().or(z.literal("")),
  sku: z.string().min(1, "Variant SKU is required").max(100),
  price: z.coerce.number().min(0, "Price must be at least 0").optional().nullable(),
  compare_at_price: z.coerce.number().min(0).optional().nullable(),
  cost_price: z.coerce.number().min(0).optional().nullable(),
  weight: z.coerce.number().min(0).optional().nullable(),
  barcode: z.string().max(100).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

type VariantFormValues = z.infer<typeof variantFormSchema>;

interface ProductVariantManagerProps {
  productId?: string;
  basePrice?: number;
  currencyCode?: string | null;
  existingVariants?: ProductVariant[];
  disabled?: boolean;
}

export function ProductVariantManager({
  productId,
  basePrice = 0,
  currencyCode,
  existingVariants = [],
  disabled = false,
}: ProductVariantManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [deletingVariant, setDeletingVariant] = useState<ProductVariant | null>(null);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);

  // Mutations
  const createMutation = useCreateVariant(productId || "");
  const updateMutation = useUpdateVariant(productId || "");
  const deleteMutation = useDeleteVariant(productId || "");

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: undefined,
      compare_at_price: undefined,
      cost_price: undefined,
      weight: undefined,
      barcode: "",
      is_active: true,
      sort_order: 0,
    },
  });

  const handleOpenCreate = () => {
    setEditingVariant(null);
    setModalErrorMessage(null);
    form.reset({
      name: "",
      sku: "",
      price: undefined,
      compare_at_price: undefined,
      cost_price: undefined,
      weight: undefined,
      barcode: "",
      is_active: true,
      sort_order: existingVariants.length,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setModalErrorMessage(null);
    form.reset({
      name: variant.name || "",
      sku: variant.sku,
      price: variant.price !== null && variant.price !== undefined ? Number(variant.price) : undefined,
      compare_at_price:
        variant.compare_at_price !== null && variant.compare_at_price !== undefined
          ? Number(variant.compare_at_price)
          : undefined,
      cost_price:
        variant.cost_price !== null && variant.cost_price !== undefined
          ? Number(variant.cost_price)
          : undefined,
      weight:
        variant.weight !== null && variant.weight !== undefined
          ? Number(variant.weight)
          : undefined,
      barcode: variant.barcode || "",
      is_active: variant.is_active ?? true,
      sort_order: variant.sort_order ?? 0,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: VariantFormValues) => {
    if (!productId) {
      toast.info("Please save the product before adding specific SKU variants.");
      return;
    }

    setModalErrorMessage(null);

    const payload: CreateVariantPayload | UpdateVariantPayload = {
      sku: values.sku,
      name: values.name || null,
      price: values.price !== null && values.price !== undefined && !isNaN(values.price) ? values.price : null,
      compare_at_price:
        values.compare_at_price !== null && values.compare_at_price !== undefined && !isNaN(values.compare_at_price)
          ? values.compare_at_price
          : null,
      cost_price:
        values.cost_price !== null && values.cost_price !== undefined && !isNaN(values.cost_price)
          ? values.cost_price
          : null,
      weight:
        values.weight !== null && values.weight !== undefined && !isNaN(values.weight)
          ? values.weight
          : null,
      barcode: values.barcode || null,
      is_active: values.is_active,
      sort_order: values.sort_order,
    };

    try {
      if (editingVariant) {
        await updateMutation.mutateAsync({
          variantId: editingVariant.id,
          data: payload,
        });
        toast.success(`Variant "${values.sku}" updated successfully!`);
      } else {
        await createMutation.mutateAsync(payload as CreateVariantPayload);
        toast.success(`Variant "${values.sku}" created successfully!`);
      }

      setIsModalOpen(false);
      form.reset();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message =
        apiErr?.message ||
        "Failed to save variant. Please ensure the SKU is unique and all values are valid.";
      setModalErrorMessage(message);
      toast.error(message);

      if (apiErr?.errors) {
        Object.entries(apiErr.errors).forEach(([field, msgs]) => {
          if (field in form.getValues()) {
            form.setError(field as keyof VariantFormValues, { message: msgs[0] });
          }
        });
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!productId || !deletingVariant) return;

    try {
      await deleteMutation.mutateAsync(deletingVariant.id);
      toast.success(`Variant "${deletingVariant.sku}" deleted.`);
      setDeletingVariant(null);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      toast.error(apiErr?.message || "Failed to delete variant.");
    }
  };

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    disabled;

  return (
    <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <h2 className="text-base font-extrabold text-slate-900">Product Variants</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage SKU variations, pricing overrides, and specifications.
          </p>
        </div>

        {productId ? (
          <Button
            type="button"
            size="sm"
            onClick={handleOpenCreate}
            disabled={isMutating}
            className="h-9 px-3.5 gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Variant</span>
          </Button>
        ) : (
          <span className="text-xs font-semibold text-slate-400">
            Available after saving product
          </span>
        )}
      </div>

      {/* Variants Table / List */}
      {existingVariants.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pr-4">Variant Name / SKU</th>
                <th className="pb-3 pr-4">Pricing (₦)</th>
                <th className="pb-3 pr-4">Compare-At</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {existingVariants.map((v) => {
                const effectivePrice =
                  v.price !== null && v.price !== undefined
                    ? Number(v.price)
                    : basePrice;

                return (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name & SKU */}
                    <td className="py-3.5 pr-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">
                          {v.name || "Standard Option"}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 block">
                          SKU: {v.sku}
                        </span>
                        {v.barcode && (
                          <span className="font-mono text-[10px] text-slate-400 block">
                            Barcode: {v.barcode}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 pr-4">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-900 text-xs">
                          {formatCurrency(effectivePrice, currencyCode)}
                        </span>
                        {v.price === null || v.price === undefined ? (
                          <span className="text-[10px] text-slate-400 block">
                            (Base product price)
                          </span>
                        ) : (
                          <span className="text-[10px] text-blue-600 font-semibold block">
                            (Override)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Compare-At */}
                    <td className="py-3.5 pr-4 text-slate-500">
                      {v.compare_at_price
                        ? formatCurrency(Number(v.compare_at_price))
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 pr-4">
                      {v.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                          <XCircle className="h-3 w-3 text-slate-400" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(v)}
                          disabled={isMutating}
                          className="h-8 px-2.5 text-xs font-semibold rounded-lg shadow-2xs"
                          aria-label={`Edit variant ${v.sku}`}
                        >
                          <Edit2 className="h-3 w-3" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingVariant(v)}
                          disabled={isMutating}
                          className="h-8 px-2.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
                          aria-label={`Delete variant ${v.sku}`}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
          <Layers className="h-8 w-8 text-slate-300 mb-2" />
          <h3 className="text-xs font-bold text-slate-800">No SKU Variants Added</h3>
          <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">
            This product currently sells as a single standalone SKU. Add variants to support different options (colors, sizes, capacities).
          </p>
          {productId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenCreate}
              disabled={isMutating}
              className="mt-4 h-9 px-4 text-xs font-bold rounded-xl bg-white shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add First Variant
            </Button>
          )}
        </div>
      )}

      {/* Add / Edit Variant Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md p-6 sm:p-7 rounded-[24px]">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-base font-extrabold text-slate-900">
              {editingVariant ? "Edit Product Variant" : "Create New Product Variant"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {editingVariant
                ? `Update SKU details and pricing overrides for ${editingVariant.sku}.`
                : "Add a specific SKU variation with custom pricing and identifiers."}
            </DialogDescription>
          </DialogHeader>

          {modalErrorMessage && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-700 mt-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{modalErrorMessage}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              {/* Variant Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">
                      Variant Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Space Gray, Large, 128GB"
                        className="h-10 text-xs rounded-xl bg-slate-50"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      Descriptive name shown to customers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SKU */}
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">
                      Variant SKU *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. NHP-SG-128"
                        className="h-10 text-xs rounded-xl bg-slate-50 font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      Must be unique across the platform.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price & Compare-at Grid */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">
                        Price ({getCurrencySymbol(currencyCode)})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={`${basePrice}`}
                          className="h-10 text-xs rounded-xl bg-slate-50"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-[10px]">
                        Leave empty to use base price.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compare_at_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">
                        Compare-At ({getCurrencySymbol(currencyCode)})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="h-10 text-xs rounded-xl bg-slate-50"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-[10px]">
                        Original price.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Barcode & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">
                        Barcode
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 194252000000"
                          className="h-10 text-xs rounded-xl bg-slate-50 font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">
                        Weight (kg)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.5"
                          className="h-10 text-xs rounded-xl bg-slate-50"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Is Active Toggle */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs font-bold text-slate-900">
                        Variant Active
                      </FormLabel>
                      <FormDescription className="text-[10px] text-slate-500">
                        Available for customer purchase.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Modal Actions */}
              <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="h-9 px-4 text-xs font-bold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                  className="h-9 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  {editingVariant ? "Save Changes" : "Create Variant"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deletingVariant)}
        onOpenChange={(open) => !open && setDeletingVariant(null)}
        title="Delete Product Variant"
        description={`Are you sure you want to delete variant "${deletingVariant?.name || deletingVariant?.sku}" (SKU: ${deletingVariant?.sku})? This action cannot be undone.`}
        confirmText="Delete Variant"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
