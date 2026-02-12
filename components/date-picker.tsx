"use client";

import { memo, useCallback } from "react";
import moment from "moment";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  /** ISO date string (YYYY-MM-DD) or empty string */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  format?: string;
}

function DatePickerInner({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  format = "DD MMM YYYY",
}: DatePickerProps) {
  const date = value ? moment(value).toDate() : undefined;

  const handleSelect = useCallback(
    (day: Date | undefined) => {
      onChange(day ? moment(day).format("YYYY-MM-DD") : "");
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left font-normal overflow-hidden",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarDays className="mr-2 size-4 shrink-0" />
          <span className="truncate">
            {value ? moment(value).format(format) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  );
}

export const DatePicker = memo(DatePickerInner);
