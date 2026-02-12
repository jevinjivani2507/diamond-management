"use client";

import { memo, useMemo } from "react";
import moment from "moment";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useDiamondStore,
  selectReceives,
  selectPersons,
  type Kapaan,
} from "@/lib/store";

interface ReceiveSheetProps {
  kapaan: Kapaan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shapeColors: Record<string, string> = {
  Round: "bg-blue-50 text-blue-700 border-blue-200",
  Princess: "bg-purple-50 text-purple-700 border-purple-200",
  Emerald: "bg-green-50 text-green-700 border-green-200",
  Oval: "bg-amber-50 text-amber-700 border-amber-200",
  Marquise: "bg-rose-50 text-rose-700 border-rose-200",
  Pear: "bg-teal-50 text-teal-700 border-teal-200",
  Cushion: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Asscher: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Radiant: "bg-orange-50 text-orange-700 border-orange-200",
  Heart: "bg-pink-50 text-pink-700 border-pink-200",
};

function ReceiveSheetInner({ kapaan, open, onOpenChange }: ReceiveSheetProps) {
  const allReceives = useDiamondStore(selectReceives);
  const persons = useDiamondStore(selectPersons);

  const receives = useMemo(
    () => (kapaan ? allReceives.filter((r) => r.kapaanId === kapaan.id) : []),
    [allReceives, kapaan]
  );

  const person = useMemo(
    () => (kapaan ? persons.find((p) => p.id === kapaan.personId) : null),
    [persons, kapaan]
  );

  const totalPcs = useMemo(
    () => receives.reduce((sum, r) => sum + r.pcs, 0),
    [receives]
  );

  const totalWeight = useMemo(
    () => receives.reduce((sum, r) => sum + r.weight, 0),
    [receives]
  );

  if (!kapaan) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Kapaan {kapaan.kapaanNo}</SheetTitle>
          <SheetDescription>
            Person: {person?.name ?? "Unknown"} &middot; {kapaan.pcs} pcs
            &middot; {kapaan.weight} ct
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/40 p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Received Pcs</p>
              <p className="text-lg font-semibold">{totalPcs}</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3 text-center">
              <p className="text-xs text-muted-foreground">
                Total Received Weight
              </p>
              <p className="text-lg font-semibold">{totalWeight.toFixed(2)} ct</p>
            </div>
          </div>

          {/* Receives Table */}
          {receives.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No receive entries yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Shape</TableHead>
                  <TableHead className="text-right">Pcs</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead>Purity</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Lab</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receives.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">
                      {moment(r.date).format("DD MMM YYYY")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                          shapeColors[r.shape] ??
                          "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {r.shape}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{r.pcs}</TableCell>
                    <TableCell className="text-right">
                      {r.weight.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.purity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.color}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          r.lab === "GIA"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }
                        variant="outline"
                      >
                        {r.lab}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const ReceiveSheet = memo(ReceiveSheetInner);
