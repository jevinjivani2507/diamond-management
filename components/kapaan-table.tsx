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
  type Receive,
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

type ViewMode = "kapaan" | "received";

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

function KapaanTableInner() {
  const kapaans = useDiamondStore(selectKapaans);
  const persons = useDiamondStore(selectPersons);
  const receives = useDiamondStore(selectReceives);
  const hydrated = useDiamondStore(selectHydrated);
  const removeKapaan = useDiamondStore((s) => s.removeKapaan);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("kapaan");

  // Kapaan filter state
  const [selectedKapaanIds, setSelectedKapaanIds] = useState<string[]>([]);
  const [personFilter, setPersonFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Receive filter state
  const [rcvShapeFilter, setRcvShapeFilter] = useState("all");
  const [rcvPurityFilter, setRcvPurityFilter] = useState("all");
  const [rcvColorFilter, setRcvColorFilter] = useState("all");
  const [rcvLabFilter, setRcvLabFilter] = useState("all");
  const [rcvKapaanFilter, setRcvKapaanFilter] = useState("all");

  // Dialog state
  const [addKapaanOpen, setAddKapaanOpen] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState<Kapaan | null>(null);
  const [editTarget, setEditTarget] = useState<Kapaan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Kapaan | null>(null);
  const [sheetKapaan, setSheetKapaan] = useState<Kapaan | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editReceiveTarget, setEditReceiveTarget] = useState<Receive | null>(null);

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

  // ── Receive view logic ──────────────────────────────────────────────────

  // Kapaan lookup map for receive view
  const kapaanMap = useMemo(
    () => new Map(kapaans.map((k) => [k.id, k])),
    [kapaans]
  );

  // Unique filter options for receives
  const rcvFilterOptions = useMemo(() => {
    const shapes = new Set<string>();
    const purities = new Set<string>();
    const colors = new Set<string>();
    const labs = new Set<string>();

    for (const r of receives) {
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
  }, [receives]);

  // Filtered receives
  const filteredReceives = useMemo(() => {
    return receives.filter((r) => {
      if (rcvKapaanFilter !== "all" && r.kapaanId !== rcvKapaanFilter) return false;
      if (rcvShapeFilter !== "all" && r.shape !== rcvShapeFilter) return false;
      if (rcvPurityFilter !== "all" && r.purity !== rcvPurityFilter) return false;
      if (rcvColorFilter !== "all" && r.color !== rcvColorFilter) return false;
      if (rcvLabFilter !== "all" && r.lab !== rcvLabFilter) return false;
      return true;
    });
  }, [receives, rcvKapaanFilter, rcvShapeFilter, rcvPurityFilter, rcvColorFilter, rcvLabFilter]);

  const hasRcvFilters =
    rcvShapeFilter !== "all" ||
    rcvPurityFilter !== "all" ||
    rcvColorFilter !== "all" ||
    rcvLabFilter !== "all" ||
    rcvKapaanFilter !== "all";

  const clearRcvFilters = useCallback(() => {
    setRcvShapeFilter("all");
    setRcvPurityFilter("all");
    setRcvColorFilter("all");
    setRcvLabFilter("all");
    setRcvKapaanFilter("all");
  }, []);

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

  const handleEditReceiveClose = useCallback((open: boolean) => {
    if (!open) setEditReceiveTarget(null);
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
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Kapaan Management</h1>
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("kapaan")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${
                  viewMode === "kapaan"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Kapaan
              </button>
              <button
                type="button"
                onClick={() => setViewMode("received")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${
                  viewMode === "received"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Received
              </button>
            </div>
          </div>
          {viewMode === "kapaan" && (
            <Button onClick={() => setAddKapaanOpen(true)} className="gap-1.5">
              <Plus className="size-4" />
              Add Kapaan
            </Button>
          )}
        </div>

        {viewMode === "kapaan" ? (
          <>
            {/* Kapaan Filters */}
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

            {/* Kapaan Content */}
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
              /* ── Kapaan Table ── */
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
          </>
        ) : (
          <>
            {/* Receive Filters */}
            <div className="grid grid-cols-5 gap-3 border-b p-4 relative">
              {hasRcvFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1.5 right-2 h-7 gap-1 text-xs text-muted-foreground"
                  onClick={clearRcvFilters}
                >
                  <X className="size-3" />
                  Clear filters
                </Button>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium">Kapaan</label>
                <Select value={rcvKapaanFilter} onValueChange={setRcvKapaanFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Kapaans</SelectItem>
                    {kapaans.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.kapaanNo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Shape</label>
                <Select value={rcvShapeFilter} onValueChange={setRcvShapeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shapes</SelectItem>
                    {rcvFilterOptions.shapes.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Purity</label>
                <Select value={rcvPurityFilter} onValueChange={setRcvPurityFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Purities</SelectItem>
                    {rcvFilterOptions.purities.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Color</label>
                <Select value={rcvColorFilter} onValueChange={setRcvColorFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colors</SelectItem>
                    {rcvFilterOptions.colors.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Lab</label>
                <Select value={rcvLabFilter} onValueChange={setRcvLabFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Labs</SelectItem>
                    {rcvFilterOptions.labs.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Receives Content */}
            {!hydrated ? (
              <div className="flex items-center justify-center py-20">
                <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            ) : filteredReceives.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted/60 mb-4">
                  <Diamond className="size-7 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold">No receives yet</h2>
                <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
                  {hasRcvFilters
                    ? "No receives match the selected filters."
                    : "Add receives from the Kapaan view to see them here."}
                </p>
              </div>
            ) : (
              <Table>
                <TableCaption className="mb-4">
                  All receive entries &middot; {filteredReceives.length} total
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kapaan No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Shape</TableHead>
                    <TableHead className="text-right">Pcs</TableHead>
                    <TableHead className="text-right">Weight (ct)</TableHead>
                    <TableHead>Purity</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Lab</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceives.map((r) => {
                    const rKapaan = kapaanMap.get(r.kapaanId);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-semibold">
                          {rKapaan?.kapaanNo ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => setEditReceiveTarget(r)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </>
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

      {editReceiveTarget && (() => {
        const rcvKapaan = kapaanMap.get(editReceiveTarget.kapaanId);
        return (
          <AddReceiveDialog
            key={editReceiveTarget.id}
            kapaanId={editReceiveTarget.kapaanId}
            kapaanNo={rcvKapaan?.kapaanNo ?? "—"}
            receive={editReceiveTarget}
            open={!!editReceiveTarget}
            onOpenChange={handleEditReceiveClose}
          />
        );
      })()}

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
