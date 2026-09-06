"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Boxes,
  Warehouse as WarehouseIcon,
  Plus,
  SlidersHorizontal,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ProductVariant } from "@/services/catalog-service";
import {
  useProductInventory,
  useWarehouses,
  useAdjustStock,
} from "@/hooks/use-inventory";
import {
  InventoryItem,
  Warehouse,
  AdjustStockPayload,
} from "@/services/inventory-service";
import { toast } from "sonner";
import { ApiError } from "@/types/api";

const adjustStockSchema = z.object({
  warehouse_id: z.string().min(1, "Warehouse is required"),
  variant_id: z.string().optional().nullable(),
  movement_type: z.enum([
    "adjustment",
    "receipt",
    "return",
    "sale",
    "transfer",
    "reservation",
    "release",
  ]),
  quantity_delta: z.coerce
    .number()
    .int("Quantity must be a whole integer")
    .refine((val) => val !== 0, "Quantity adjustment cannot be zero"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;

interface ProductInventoryManagerProps {
  productId?: string;
  productName?: string;
  productSku?: string;
  variants?: ProductVariant[];
  disabled?: boolean;
}

export function ProductInventoryManager({
  productId,
  productName = "Product",
  productSku = "",
  variants = [],
  disabled = false,
}: ProductInventoryManagerProps) {
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<{
    warehouseId?: string;
    variantId?: string | null;
  } | null>(null);
  const [expandedMovementsItemId, setExpandedMovementsItemId] = useState<string | null>(null);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);

  // Queries & Mutations
  const { data: inventoryData, isLoading: isLoadingInventory } = useProductInventory(productId || "");
  const { data: warehouseData } = useWarehouses();
  const adjustStockMutation = useAdjustStock();

  const inventoryItems: InventoryItem[] = inventoryData?.data || [];
  const warehouses: Warehouse[] = warehouseData || [];

  const defaultWarehouse = warehouses.find((w) => w.is_default) || warehouses[0];

  const form = useForm<AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      warehouse_id: defaultWarehouse?.id || "",
      variant_id: null,
      movement_type: "adjustment",
      quantity_delta: 10,
      notes: "",
    },
  });

  const handleOpenAdjust = (targetWarehouseId?: string, targetVariantId?: string | null) => {
    setModalErrorMessage(null);
    setSelectedTarget({
      warehouseId: targetWarehouseId,
      variantId: targetVariantId,
    });

    form.reset({
      warehouse_id: targetWarehouseId || defaultWarehouse?.id || "",
      variant_id: targetVariantId !== undefined ? targetVariantId : null,
      movement_type: "adjustment",
      quantity_delta: 10,
      notes: "",
    });

    setIsAdjustModalOpen(true);
  };

  const onSubmitAdjust = async (values: AdjustStockFormValues) => {
    if (!productId) {
      toast.info("Please save the product record before adjusting inventory.");
      return;
    }

    setModalErrorMessage(null);

    const payload: AdjustStockPayload = {
      product_id: productId,
      variant_id: values.variant_id || null,
      warehouse_id: values.warehouse_id,
      quantity_delta: values.quantity_delta,
      movement_type: values.movement_type,
      notes: values.notes || null,
    };

    try {
      await adjustStockMutation.mutateAsync(payload);
      toast.success(
        `Stock adjusted by ${values.quantity_delta > 0 ? `+${values.quantity_delta}` : values.quantity_delta} units.`
      );
      setIsAdjustModalOpen(false);
      form.reset();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message =
        apiErr?.message ||
        "Failed to adjust stock. Please ensure quantities and parameters are valid.";
      setModalErrorMessage(message);
      toast.error(message);

      if (apiErr?.errors) {
        Object.entries(apiErr.errors).forEach(([field, msgs]) => {
          if (field in form.getValues()) {
            form.setError(field as keyof AdjustStockFormValues, { message: msgs[0] });
          }
        });
      }
    }
  };

  const toggleMovements = (itemId: string) => {
    setExpandedMovementsItemId((prev) => (prev === itemId ? null : itemId));
  };

  return (
    <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <h2 className="text-base font-extrabold text-slate-900">Inventory &amp; Warehouses</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time physical stock on hand, reservations, reorder thresholds, and warehouse ledgers.
          </p>
        </div>

        {productId ? (
          <Button
            type="button"
            size="sm"
            onClick={() => handleOpenAdjust()}
            disabled={disabled || adjustStockMutation.isPending}
            className="h-9 px-3.5 gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Adjust Stock</span>
          </Button>
        ) : (
          <span className="text-xs font-semibold text-slate-400">
            Available after saving product
          </span>
        )}
      </div>

      {/* Inventory Items List / Table */}
      {isLoadingInventory ? (
        <div className="py-8 text-center text-xs text-slate-400 font-semibold animate-pulse">
          Loading inventory records across distribution hubs...
        </div>
      ) : inventoryItems.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">Warehouse Hub</th>
                  <th className="pb-3 pr-4">Target SKU / Option</th>
                  <th className="pb-3 pr-4 text-center">On Hand</th>
                  <th className="pb-3 pr-4 text-center">Reserved</th>
                  <th className="pb-3 pr-4 text-center">Available</th>
                  <th className="pb-3 pr-4">Stock Health</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryItems.map((item) => {
                  const warehouseName = item.warehouse?.name || "Main Warehouse";
                  const warehouseCode = item.warehouse?.code || "WH-01";
                  const targetLabel = item.variant
                    ? item.variant.name || item.variant.sku
                    : `Base Product (${productSku || "Standalone"})`;
                  const isLow = item.is_low_stock || item.quantity_available <= item.reorder_point;
                  const isOut = item.is_out_of_stock || item.quantity_available <= 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Warehouse */}
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <WarehouseIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block">{warehouseName}</span>
                            <span className="font-mono text-[10px] text-slate-500 block">
                              {warehouseCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Target SKU / Option */}
                      <td className="py-3.5 pr-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 block">
                            {targetLabel}
                          </span>
                          {item.variant_id && (
                            <span className="font-mono text-[10px] text-blue-600 block">
                              Variant SKU: {item.variant?.sku}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* On Hand */}
                      <td className="py-3.5 pr-4 text-center font-bold text-slate-700">
                        {item.quantity_on_hand}
                      </td>

                      {/* Reserved */}
                      <td className="py-3.5 pr-4 text-center font-semibold text-amber-600">
                        {item.quantity_reserved}
                      </td>

                      {/* Available */}
                      <td className="py-3.5 pr-4 text-center font-extrabold text-slate-900 text-sm">
                        {item.quantity_available}
                      </td>

                      {/* Stock Health */}
                      <td className="py-3.5 pr-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                            <XCircle className="h-3 w-3 text-rose-600" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                            <AlertTriangle className="h-3 w-3 text-amber-600" />
                            <span>Low Stock (≤{item.reorder_point})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Optimal Stock</span>
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
                            onClick={() => handleOpenAdjust(item.warehouse_id, item.variant_id)}
                            disabled={disabled || adjustStockMutation.isPending}
                            className="h-8 px-2.5 text-xs font-semibold rounded-lg shadow-2xs"
                            aria-label={`Adjust stock for ${targetLabel}`}
                          >
                            <SlidersHorizontal className="h-3 w-3" />
                            <span className="sr-only sm:not-sr-only sm:ml-1">Adjust</span>
                          </Button>

                          {item.movements && item.movements.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMovements(item.id)}
                              className="h-8 px-2 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-900"
                              aria-label="Toggle stock history"
                            >
                              <History className="h-3 w-3" />
                              {expandedMovementsItemId === item.id ? (
                                <ChevronUp className="h-3 w-3 ml-0.5" />
                              ) : (
                                <ChevronDown className="h-3 w-3 ml-0.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded Movement Log Section */}
          {expandedMovementsItemId && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 pb-1 border-b border-slate-200">
                <History className="h-3.5 w-3.5 text-blue-600" />
                <span>Recent Stock Movements for Selected Hub</span>
              </div>

              {inventoryItems
                .find((i) => i.id === expandedMovementsItemId)
                ?.movements?.slice(0, 5)
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 capitalize">
                        {m.movement_type}
                      </span>
                      {m.notes && <span className="text-slate-500 italic">({m.notes})</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold font-mono ${
                          m.quantity > 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity} units
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
          <Boxes className="h-8 w-8 text-slate-300 mb-2" />
          <h3 className="text-xs font-bold text-slate-800">No Warehouse Inventory Initialized</h3>
          <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">
            This product does not currently have physical stock registered at any distribution hub.
            Initialize inventory by recording an initial stock receipt or adjustment.
          </p>
          {productId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenAdjust()}
              disabled={disabled || adjustStockMutation.isPending}
              className="mt-4 h-9 px-4 text-xs font-bold rounded-xl bg-white shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Initialize Warehouse Stock
            </Button>
          )}
        </div>
      )}

      {/* Adjust Stock Modal Dialog */}
      <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
        <DialogContent className="max-w-md p-6 sm:p-7 rounded-[24px]">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-base font-extrabold text-slate-900">
              Adjust Warehouse Inventory
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Record physical stock adjustments, supplier receipts, or manual corrections with an immutable audit trail.
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
            <form onSubmit={form.handleSubmit(onSubmitAdjust)} className="space-y-4 pt-2">
              {/* Warehouse Selection */}
              <FormField
                control={form.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">
                      Distribution Warehouse *
                    </FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                        {...field}
                      >
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.code}) {w.is_default ? "— Primary Hub" : ""}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Variant Target Selection */}
              {variants.length > 0 && (
                <FormField
                  control={form.control}
                  name="variant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">
                        Target SKU / Option
                      </FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        >
                          <option value="">Base Product ({productSku || "Standalone"})</option>
                          {variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name || "Variant"} (SKU: {v.sku})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription className="text-[10px]">
                        Choose whether adjusting base product stock or a specific variant SKU.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Movement Classification */}
              <FormField
                control={form.control}
                name="movement_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">
                      Adjustment Type *
                    </FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                        {...field}
                      >
                        <option value="adjustment">Manual Stock Adjustment</option>
                        <option value="receipt">Stock Receipt (Supplier Inflow)</option>
                        <option value="return">Customer Return Restock</option>
                        <option value="sale">Direct Sale Deduction</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity Delta */}
              <FormField
                control={form.control}
                name="quantity_delta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">
                      Quantity Delta (Units) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="e.g. 25 or -5"
                        className="h-10 text-xs rounded-xl bg-slate-50 font-mono"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      Enter a positive integer (e.g. 50) to add units or negative (e.g. -10) to deduct units.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reason / Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">
                      Reason / Reference Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Annual physical inventory audit reconciliation or Purchase Order #PO-8821"
                        rows={2}
                        className="text-xs rounded-xl bg-slate-50 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Modal Footer */}
              <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdjustModalOpen(false)}
                  disabled={adjustStockMutation.isPending}
                  className="h-9 px-4 text-xs font-bold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={adjustStockMutation.isPending}
                  className="h-9 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Submit Adjustment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
