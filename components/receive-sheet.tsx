"use client";

import { memo, useCallback, useMemo, useState } from "react";
import moment from "moment";
import { Filter, Pencil, Trash2, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useDiamondStore,
  selectReceives,
  selectPersons,
  type Kapaan,
  type Receive,
} from "@/lib/store";
import { AddReceiveDialog } from "@/components/add-receive-dialog";

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
  const removeReceive = useDiamondStore((s) => s.removeReceive);

  // Edit state
  const [editReceive, setEditReceive] = useState<Receive | null>(null);
  // Delete state
  const [deleteReceive, setDeleteReceive] = useState<Receive | null>(null);

  // Filters
  const [shapeFilter, setShapeFilter] = useState("all");
  const [purityFilter, setPurityFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [labFilter, setLabFilter] = useState("all");

  const handleEditClose = useCallback((open: boolean) => {
    if (!open) setEditReceive(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteReceive) removeReceive(deleteReceive.id);
    setDeleteReceive(null);
  }, [deleteReceive, removeReceive]);

  // Reset filters when closing
  const handleOpenChange = useCallback(
    (val: boolean) => {
      if (!val) {
        setShapeFilter("all");
        setPurityFilter("all");
        setColorFilter("all");
        setLabFilter("all");
        setEditReceive(null);
        setDeleteReceive(null);
      }
      onOpenChange(val);
    },
    [onOpenChange]
  );

  // Receives for this kapaan
  const kapaanReceives = useMemo(
    () => (kapaan ? allReceives.filter((r) => r.kapaanId === kapaan.id) : []),
    [allReceives, kapaan]
  );

  // Unique filter options
  const filterOptions = useMemo(() => {
    const shapes = new Set<string>();
    const purities = new Set<string>();
    const colors = new Set<string>();
    const labs = new Set<string>();

    for (const r of kapaanReceives) {
      if (r.shape) shapes.add(r.shape);
      if (r.purity) purities.add(r.purity);
      if (r.color) colors.add(r.color);
      if (r.lab) labs.add(r.lab);
    }

    return {
      shapes: Array.from(shapes).sort(),
      purities: Array.from(purities).sort(),
      colors: Array.from(colors).sort(),
      labs: Array.from(labs).sort(),
    };
  }, [kapaanReceives]);

  // Apply filters
  const receives = useMemo(() => {
    return kapaanReceives.filter((r) => {
      if (shapeFilter !== "all" && r.shape !== shapeFilter) return false;
      if (purityFilter !== "all" && r.purity !== purityFilter) return false;
      if (colorFilter !== "all" && r.color !== colorFilter) return false;
      if (labFilter !== "all" && r.lab !== labFilter) return false;
      return true;
    });
  }, [kapaanReceives, shapeFilter, purityFilter, colorFilter, labFilter]);

  const hasFilters =
    shapeFilter !== "all" ||
    purityFilter !== "all" ||
    colorFilter !== "all" ||
    labFilter !== "all";

  const clearFilters = useCallback(() => {
    setShapeFilter("all");
    setPurityFilter("all");
    setColorFilter("all");
    setLabFilter("all");
  }, []);

  const person = useMemo(
    () => (kapaan ? persons.find((p) => p.id === kapaan.personId) : null),
    [persons, kapaan]
  );

  const totalPcs = useMemo(
    () => receives.reduce((sum, r) => sum + (r.pcs || 0), 0),
    [receives]
  );

  const totalWeight = useMemo(
    () => receives.reduce((sum, r) => sum + (r.weight || 0), 0),
    [receives]
  );

  if (!kapaan) return null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Kapaan {kapaan.kapaanNo}</SheetTitle>
          <SheetDescription>
            Person: {person?.name ?? "Unknown"} &middot; {kapaan.pcs} pcs
            &middot; {kapaan.weight} ct
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-4">
          {/* Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Filter className="size-3" />
                Filters
              </div>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 text-xs text-muted-foreground px-2"
                  onClick={clearFilters}
                >
                  <X className="size-3" />
                  Clear
                </Button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Select value={shapeFilter} onValueChange={setShapeFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Shape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shapes</SelectItem>
                  {filterOptions.shapes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={purityFilter} onValueChange={setPurityFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Purity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purities</SelectItem>
                  {filterOptions.purities.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={colorFilter} onValueChange={setColorFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  {filterOptions.colors.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={labFilter} onValueChange={setLabFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Lab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Labs</SelectItem>
                  {filterOptions.labs.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              {hasFilters
                ? "No receives match the selected filters."
                : "No receive entries yet."}
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
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receives.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">
                      {r.date
                        ? moment(r.date).format("DD MMM YYYY")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {r.shape ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                            shapeColors[r.shape] ??
                            "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {r.shape}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.pcs || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.weight ? r.weight.toFixed(2) : "—"}
                    </TableCell>
                    <TableCell>
                      {r.purity ? (
                        <Badge variant="outline">{r.purity}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.color ? (
                        <Badge variant="secondary">{r.color}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.lab ? (
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
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => setEditReceive(r)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteReceive(r)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Edit Receive Dialog */}
        {editReceive && kapaan && (
          <AddReceiveDialog
            key={editReceive.id}
            kapaanId={kapaan.id}
            kapaanNo={kapaan.kapaanNo}
            receive={editReceive}
            open={!!editReceive}
            onOpenChange={handleEditClose}
          />
        )}

        {/* Delete Receive Confirmation */}
        <AlertDialog
          open={!!deleteReceive}
          onOpenChange={(val) => !val && setDeleteReceive(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Receive?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this receive entry
                {deleteReceive?.date
                  ? ` from ${moment(deleteReceive.date).format("DD MMM YYYY")}`
                  : ""}
                . This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}

export const ReceiveSheet = memo(ReceiveSheetInner);
