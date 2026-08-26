"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSearchSuggestions } from "@/hooks/use-storefront";
import { formatCurrency } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestions, isLoading } = useSearchSuggestions(query);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestionClick = (slug: string) => {
    onOpenChange(false);
    router.push(`/products/${slug}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[20px] bg-white shadow-2xl border border-slate-200/90 top-[20%] translate-y-0">
        <DialogTitle className="sr-only">Search Catalog</DialogTitle>
        <DialogDescription className="sr-only">Search neural headsets, sensors, and hardware</DialogDescription>
        <form onSubmit={handleSearchSubmit} className="relative border-b border-slate-100 px-4 py-3 flex items-center">
          <Search className="h-4 w-4 text-slate-400 shrink-0 mr-3" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search neural headsets, EEG sensors, biometric implants..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
            aria-label="Search catalog"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded bg-slate-100 px-1.5 font-mono text-[10px] font-bold text-slate-500">
              ESC to close
            </kbd>
          )}
        </form>

        {/* Live Search Suggestions */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-2">
          {query.trim().length >= 2 && suggestions && suggestions.length > 0 ? (
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                Instant Product Matches
              </span>
              <div className="space-y-0.5">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSuggestionClick(item.slug)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </span>
                    </div>
                    {item.price !== undefined && (
                      <span className="text-xs font-extrabold text-blue-600 shrink-0 ml-2">
                        {formatCurrency(item.price)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Press <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">Enter</kbd> to search full catalog for "{query}".
            </div>
          ) : (
            <div className="p-3 text-xs text-slate-500 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-2 px-1">
                {["Neural Interface", "EEG Sensor", "Brainwave Headset", "Cortex Adapter"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                    }}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
