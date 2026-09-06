import { useQuery } from "@tanstack/react-query";
import { invoiceService, InvoiceQueryParams } from "@/services/invoice-service";

export const INVOICE_KEYS = {
  all: ["invoices"] as const,
  lists: () => [...INVOICE_KEYS.all, "list"] as const,
  list: (params?: InvoiceQueryParams) => [...INVOICE_KEYS.lists(), params] as const,
  details: () => [...INVOICE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...INVOICE_KEYS.details(), id] as const,
};

export function useInvoices(params?: InvoiceQueryParams) {
  return useQuery({
    queryKey: INVOICE_KEYS.list(params),
    queryFn: () => invoiceService.getInvoices(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: INVOICE_KEYS.detail(id),
    queryFn: () => invoiceService.getInvoice(id),
    enabled: Boolean(id),
  });
}
