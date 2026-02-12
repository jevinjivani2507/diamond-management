"use client";

import {
  memo,
  useCallback,
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import moment from "moment";
import { Diamond, PackageOpen, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  useDiamondStore,
  selectKapaans,
  selectPersons,
  selectReceives,
  selectHydrated,
  type Kapaan,
} from "@/lib/store";
import { AddKapaanDialog } from "@/components/add-kapaan-dialog";
import { AddReceiveDialog } from "@/components/add-receive-dialog";
import { ReceiveSheet } from "@/components/receive-sheet";
import { MultiSelectKapaan } from "@/components/multi-select-kapaan";
import { DatePicker } from "@/components/date-picker";

// ── Memoised Row ───────────────────────────────────────────────────────────

interface KapaanRowProps {
  kapaan: Kapaan;
  personName: string;
  receiveCount: number;
  onRowClick: (kapaan: Kapaan) => void;
  onAddReceive: (kapaan: Kapaan) => void;
  onEdit: (kapaan: Kapaan) => void;
  onDelete: (kapaan: Kapaan) => void;
}

const KapaanRow = memo(function KapaanRow({
  kapaan,
  personName,
  receiveCount,
  onRowClick,
  onAddReceive,
  onEdit,
  onDelete,
}: KapaanRowProps) {
  const handleRowClick = useCallback(() => {
    onRowClick(kapaan);
  }, [kapaan, onRowClick]);

  const stop = (e: MouseEvent) => e.stopPropagation();

  const handleAddReceive = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onAddReceive(kapaan);
    },
    [kapaan, onAddReceive]
  );

  const handleEdit = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onEdit(kapaan);
    },
    [kapaan, onEdit]
  );

  const handleDelete = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onDelete(kapaan);
    },
    [kapaan, onDelete]
  );

  const formattedDate = moment(kapaan.date).format("DD MMM YYYY");

  return (
    <TableRow className="cursor-pointer" onClick={handleRowClick}>
      <TableCell className="font-semibold">{kapaan.kapaanNo}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formattedDate}
      </TableCell>
      <TableCell className="text-right">{kapaan.pcs}</TableCell>
      <TableCell className="text-right">{kapaan.weight}</TableCell>
      <TableCell>{personName}</TableCell>
      <TableCell>
        <Badge variant="outline">{receiveCount}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1" onClick={stop}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1"
            onClick={handleAddReceive}
          >
            <Plus className="size-3.5" />
            Receive
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handleEdit}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

// ── Main Table ─────────────────────────────────────────────────────────────

function KapaanTableInner() {
  const kapaans = useDiamondStore(selectKapaans);
  const persons = useDiamondStore(selectPersons);
  const receives = useDiamondStore(selectReceives);
  const hydrated = useDiamondStore(selectHydrated);
  const removeKapaan = useDiamondStore((s) => s.removeKapaan);

  // Filter state
  const [selectedKapaanIds, setSelectedKapaanIds] = useState<string[]>([]);
  const [personFilter, setPersonFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Dialog state
  const [addKapaanOpen, setAddKapaanOpen] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState<Kapaan | null>(null);
  const [editTarget, setEditTarget] = useState<Kapaan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Kapaan | null>(null);
  const [sheetKapaan, setSheetKapaan] = useState<Kapaan | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Multi-select options (memoised, unique by kapaanNo)
  const kapaanOptions = useMemo(() => {
    const seen = new Set<string>();
    return kapaans.reduce<{ value: string; label: string }[]>((acc, k) => {
      if (!seen.has(k.kapaanNo)) {
        seen.add(k.kapaanNo);
        acc.push({ value: k.id, label: k.kapaanNo });
      }
      return acc;
    }, []);
  }, [kapaans]);

  // Lookup maps (memoised)
  const personMap = useMemo(
    () => new Map(persons.map((p) => [p.id, p.name])),
    [persons]
  );

  const receiveCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of receives) {
      map.set(r.kapaanId, (map.get(r.kapaanId) ?? 0) + 1);
    }
    return map;
  }, [receives]);

  const hasFilters =
    selectedKapaanIds.length > 0 ||
    personFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  const clearFilters = useCallback(() => {
    setSelectedKapaanIds([]);
    setPersonFilter("all");
    setDateFrom("");
    setDateTo("");
  }, []);

  // Build a set of selected kapaanNo values for filtering
  const selectedKapaanNos = useMemo(() => {
    if (selectedKapaanIds.length === 0) return null;
    const idToNo = new Map(kapaans.map((k) => [k.id, k.kapaanNo]));
    return new Set(selectedKapaanIds.map((id) => idToNo.get(id)).filter(Boolean));
  }, [selectedKapaanIds, kapaans]);

  // Filtered kapaans
  const filteredKapaans = useMemo(() => {
    return kapaans.filter((k) => {
      if (selectedKapaanNos && !selectedKapaanNos.has(k.kapaanNo))
        return false;
      if (personFilter !== "all" && k.personId !== personFilter) return false;
      if (dateFrom && k.date < dateFrom) return false;
      if (dateTo && k.date > dateTo) return false;
      return true;
    });
  }, [kapaans, selectedKapaanNos, personFilter, dateFrom, dateTo]);

  // Handlers
  const handleRowClick = useCallback((kapaan: Kapaan) => {
    setSheetKapaan(kapaan);
    setSheetOpen(true);
  }, []);

  const handleAddReceive = useCallback((kapaan: Kapaan) => {
    setReceiveTarget(kapaan);
  }, []);

  const handleReceiveDialogClose = useCallback((open: boolean) => {
    if (!open) setReceiveTarget(null);
  }, []);

  const handleEdit = useCallback((kapaan: Kapaan) => {
    setEditTarget(kapaan);
  }, []);

  const handleEditClose = useCallback((open: boolean) => {
    if (!open) setEditTarget(null);
  }, []);

  const handleDelete = useCallback((kapaan: Kapaan) => {
    setDeleteTarget(kapaan);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      removeKapaan(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, removeKapaan]);

  return (
    <>
      <div className="rounded-xl border bg-white shadow-sm min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h1 className="text-lg font-semibold">Kapaan Management</h1>
          <Button onClick={() => setAddKapaanOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            Add Kapaan
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-4 gap-3 border-b p-4 relative">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1.5 right-2 h-7 gap-1 text-xs text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="size-3" />
              Clear filters
            </Button>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Kapaan No.
            </label>
            <MultiSelectKapaan
              options={kapaanOptions}
              selected={selectedKapaanIds}
              onChange={setSelectedKapaanIds}
              placeholder="All Kapaans"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Person</label>
            <Select value={personFilter} onValueChange={setPersonFilter}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {persons.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Date From
            </label>
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="From"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Date To</label>
            <DatePicker
              value={dateTo}
              onChange={setDateTo}
              placeholder="To"
            />
          </div>
        </div>

        {/* Content */}
        {!hydrated ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : kapaans.length === 0 ? (
          /* ── Empty state (no kapaans at all) ── */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted/60 mb-4">
              <Diamond className="size-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">No kapaans yet</h2>
            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
              Get started by adding your first kapaan. All data is saved
              automatically in your browser.
            </p>
            <Button
              onClick={() => setAddKapaanOpen(true)}
              className="mt-5 gap-1.5"
            >
              <Plus className="size-4" />
              Add Your First Kapaan
            </Button>
          </div>
        ) : (
          /* ── Table ── */
          <Table>
            <TableCaption className="mb-4">
              Kapaan inventory &middot; Click a row to view receives
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Kapaan No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Pcs</TableHead>
                <TableHead className="text-right">Weight (ct)</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Receives</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKapaans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <PackageOpen className="size-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No results
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Try adjusting your filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredKapaans.map((k) => (
                  <KapaanRow
                    key={k.id}
                    kapaan={k}
                    personName={personMap.get(k.personId) ?? "Unknown"}
                    receiveCount={receiveCountMap.get(k.id) ?? 0}
                    onRowClick={handleRowClick}
                    onAddReceive={handleAddReceive}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialogs / Sheet */}
      <AddKapaanDialog
        open={addKapaanOpen}
        onOpenChange={setAddKapaanOpen}
      />

      {editTarget && (
        <AddKapaanDialog
          key={editTarget.id}
          kapaan={editTarget}
          open={!!editTarget}
          onOpenChange={handleEditClose}
        />
      )}

      {receiveTarget && (
        <AddReceiveDialog
          kapaanId={receiveTarget.id}
          kapaanNo={receiveTarget.kapaanNo}
          open={!!receiveTarget}
          onOpenChange={handleReceiveDialogClose}
        />
      )}

      <ReceiveSheet
        kapaan={sheetKapaan}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Kapaan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">{deleteTarget?.kapaanNo}</span>{" "}
              and all its receive entries. This action cannot be undone.
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
    </>
  );
}

export const KapaanTable = memo(KapaanTableInner);
