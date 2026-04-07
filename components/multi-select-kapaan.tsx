"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectKapaanProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

function MultiSelectKapaanInner({
  options,
  selected,
  onChange,
  placeholder = "All Kapaans",
}: MultiSelectKapaanProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setSearchQuery("");
  }, []);

  const toggle = useCallback(
    (value: string) => {
      onChange(
        selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value]
      );
    },
    [selected, onChange]
  );

  const clearAll = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange([]);
    },
    [onChange]
  );

  const selectedLabels = useMemo(() => {
    const map = new Map(options.map((o) => [o.value, o.label]));
    return selected.map((v) => map.get(v) ?? v);
  }, [selected, options]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, searchQuery]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 font-normal"
        >
          <span className="truncate text-sm">
            {selected.length === 0
              ? placeholder
              : selected.length === 1
                ? selectedLabels[0]
                : `${selected.length} selected`}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {selected.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                onClick={clearAll}
                onKeyDown={(e) => {
                  if (e.key === "Enter") clearAll(e as unknown as React.MouseEvent);
                }}
                className="rounded-full p-0.5 hover:bg-muted"
              >
                <X className="size-3" />
              </span>
            )}
            <ChevronsUpDown className="size-3.5 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        {/* Search input */}
        <div className="flex items-center gap-2 border-b px-2 py-1.5">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search kapaans..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-full p-0.5 hover:bg-muted"
            >
              <X className="size-3 text-muted-foreground" />
            </button>
          )}
        </div>
        {/* Options list */}
        <div className="max-h-52 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {options.length === 0 ? "No kapaans available" : "No results found"}
            </p>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent",
                    isSelected && "bg-accent/50"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[3px] border",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input"
                    )}
                  >
                    {isSelected && <Check className="size-3" />}
                  </div>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const MultiSelectKapaan = memo(MultiSelectKapaanInner);
