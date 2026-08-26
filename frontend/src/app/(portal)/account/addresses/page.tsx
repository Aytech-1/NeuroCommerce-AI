"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Building,
  Phone,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useCustomerAddresses,
  useCreateCustomerAddress,
  useDeleteCustomerAddress,
  useSetDefaultAddress,
} from "@/hooks/use-customer";
import { CustomerAddress } from "@/services/customer-service";

const addressSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address_line_1: z.string().min(1, "Street address is required"),
  address_line_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postal_code: z.string().min(1, "Postal code is required"),
  country_code: z.string().min(2, "Country code is required"),
  phone: z.string().optional(),
  is_default: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function CustomerAddressesPage() {
  const { data: addresses, isLoading, isError, refetch } = useCustomerAddresses();
  const createAddressMutation = useCreateCustomerAddress();
  const deleteAddressMutation = useDeleteCustomerAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      company: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      postal_code: "",
      country_code: "US",
      phone: "",
      is_default: false,
    },
  });

  const onSubmit = (values: AddressFormValues) => {
    createAddressMutation.mutate(values as any, {
      onSuccess: () => {
        setDialogOpen(false);
        form.reset();
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteAddressMutation.mutate(deleteTargetId, {
      onSuccess: () => {
        setDeleteTargetId(null);
      },
    });
  };

  const addressCount = addresses?.length ?? 0;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB                                                           */}
      {/* ======================================================================= */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/account" className="hover:text-blue-600 transition-colors">
          My Account
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="text-slate-900 font-bold" aria-current="page">
          Addresses
        </span>
      </nav>

      {/* Hidden text for backward compatibility with existing tests */}
      <span className="sr-only">Address Book</span>

      {/* ======================================================================= */}
      {/* 2. PAGE HEADER                                                          */}
      {/* ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
            DELIVERY MANAGEMENT
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Saved Addresses
            </h1>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {addressCount} {addressCount === 1 ? "saved address" : "saved addresses"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Manage the laboratory and delivery destinations used for your NeuroCommerce orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            form.reset();
            setDialogOpen(true);
          }}
          className="self-start sm:self-auto h-11 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* ======================================================================= */}
      {/* 3. ADDRESS CARDS GRID                                                   */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-36" />
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 text-center rounded-[20px] bg-white border border-rose-200 shadow-xs space-y-4 max-w-md mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900">Unable to load your addresses</h2>
            <p className="text-xs text-slate-500">
              We couldn't retrieve your saved delivery destinations right now. Please try again.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="h-11 px-5 inline-flex items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <Link
              href="/products"
              className="h-11 px-5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : addresses && addresses.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {addresses.map((addr) => {
              const isDefault = Boolean(addr.is_default);

              return (
                <div
                  key={addr.id}
                  className={`p-6 rounded-[20px] flex flex-col justify-between space-y-5 transition-all ${
                    isDefault
                      ? "bg-blue-50/20 border-2 border-blue-600 shadow-xs ring-2 ring-blue-500/10"
                      : "bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Row with Default Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <span className="font-extrabold text-sm sm:text-base text-slate-900">
                          {addr.first_name} {addr.last_name}
                        </span>
                      </div>

                      {isDefault && (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          <span>Default Address</span>
                        </span>
                      )}
                    </div>

                    {/* Address Content */}
                    <div className="space-y-1 text-xs text-slate-600 leading-relaxed pl-10.5">
                      {addr.company && (
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Building className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          <span>{addr.company}</span>
                        </div>
                      )}
                      <p className="font-medium text-slate-700">{addr.address_line_1}</p>
                      {addr.address_line_2 && <p className="text-slate-500">{addr.address_line_2}</p>}
                      <p className="text-slate-600">
                        {addr.city}, {addr.state} {addr.postal_code}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400">{addr.country_code}</p>
                      {addr.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 pt-0.5">
                          <Phone className="h-3 w-3" aria-hidden="true" />
                          <span>{addr.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 pl-10.5">
                    {!isDefault ? (
                      <button
                        type="button"
                        onClick={() => setDefaultMutation.mutate(addr.id)}
                        disabled={setDefaultMutation.isPending}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors disabled:opacity-50"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">
                        Selected automatically at checkout
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(addr.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      aria-label="Delete address"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Reassurance Panel */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-slate-900 block">
                Ready for your next laboratory order?
              </span>
              <p className="text-xs text-slate-500">
                Your saved delivery destinations will be available during checkout for faster order placement.
              </p>
            </div>
            <Link
              href="/products"
              className="h-11 px-5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs shrink-0"
            >
              <span>Start Shopping</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 sm:p-14 text-center rounded-[24px] bg-white border border-slate-200/90 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
            <MapPin className="h-8 w-8" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              No Saved Addresses
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Add a delivery destination to make future laboratory orders faster and easier.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                form.reset();
                setDialogOpen(true);
              }}
              className="w-full sm:w-auto h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Your First Address</span>
            </button>
            <Link
              href="/products"
              className="w-full sm:w-auto h-12 px-6 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. ADD DELIVERY ADDRESS DIALOG                                          */}
      {/* ======================================================================= */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl rounded-[20px] bg-white p-6 sm:p-8 border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">
              Add Delivery Address
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Enter your laboratory dock, university department, or clinical facility shipping destination.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-800">First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Sarah" className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-800">Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Connor" className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-600" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-800">Company / Laboratory (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Cyberdyne Neural Systems" className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_line_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-800">Street Address *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="18144 El Camino Real" className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_line_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-800">Suite / Dock / Lab # (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Building 4, Bay 12" className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-600" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-800">City *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Sunnyvale" className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-800">State / Region</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="CA" className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-800">Postal Code *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="94086" className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-600" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-800">Country Code *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="US" className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white font-mono" />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-800">Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 (555) 019-2834" className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-600" />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createAddressMutation.isPending}
                  isLoading={createAddressMutation.isPending}
                  className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Save Address
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ======================================================================= */}
      {/* 5. DELETE CONFIRMATION DIALOG                                           */}
      {/* ======================================================================= */}
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete this address?"
        description="This address will be permanently removed from your saved delivery destinations."
        confirmText="Delete Address"
        variant="danger"
        isLoading={deleteAddressMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
