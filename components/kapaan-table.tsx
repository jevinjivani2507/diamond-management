"use client";

import {
  memo,
  useCallback,
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import { Diamond, PackageOpen, Plus, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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

// ── Memoised Row ───────────────────────────────────────────────────────────

interface KapaanRowProps {
  kapaan: Kapaan;
  personName: string;
  receiveCount: number;
  onRowClick: (kapaan: Kapaan) => void;
  onAddReceive: (kapaan: Kapaan) => void;
}

const KapaanRow = memo(function KapaanRow({
  kapaan,
  personName,
  receiveCount,
  onRowClick,
  onAddReceive,
}: KapaanRowProps) {
  const handleRowClick = useCallback(() => {
    onRowClick(kapaan);
  }, [kapaan, onRowClick]);

  const handleAddReceive = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onAddReceive(kapaan);
    },
    [kapaan, onAddReceive]
  );

  const formattedDate = new Date(kapaan.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <TableRow
      className="cursor-pointer"
      onClick={handleRowClick}
    >
      <TableCell className="font-semibold">{kapaan.kapaanNo}</TableCell>
      <TableCell className="text-muted-foreground text-sm">{formattedDate}</TableCell>
      <TableCell className="text-right">{kapaan.pcs}</TableCell>
      <TableCell className="text-right">{kapaan.weight}</TableCell>
      <TableCell>{personName}</TableCell>
      <TableCell>
        <Badge variant="outline">{receiveCount}</Badge>
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1"
          onClick={handleAddReceive}
        >
          <Plus className="size-3.5" />
          Receive
        </Button>
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

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [personFilter, setPersonFilter] = useState("all");
  const [weightMin, setWeightMin] = useState("");
  const [weightMax, setWeightMax] = useState("");

  // Dialog state
  const [addKapaanOpen, setAddKapaanOpen] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState<Kapaan | null>(null);
  const [sheetKapaan, setSheetKapaan] = useState<Kapaan | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  // Filtered kapaans
  const filteredKapaans = useMemo(() => {
    return kapaans.filter((k) => {
      if (
        searchQuery &&
        !k.kapaanNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (personFilter !== "all" && k.personId !== personFilter) return false;
      if (weightMin && k.weight < Number(weightMin)) return false;
      if (weightMax && k.weight > Number(weightMax)) return false;
      return true;
    });
  }, [kapaans, searchQuery, personFilter, weightMin, weightMax]);

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

  return (
    <>
      <div className="rounded-xl border bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h1 className="text-lg font-semibold">Kapaan Management</h1>
          <Button onClick={() => setAddKapaanOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            Add Kapaan
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-4 border-b p-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Kapaan No.
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search kapaan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
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
              Weight (ct)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Min"
                type="number"
                step="0.01"
                value={weightMin}
                onChange={(e) => setWeightMin(e.target.value)}
              />
              <Input
                placeholder="Max"
                type="number"
                step="0.01"
                value={weightMax}
                onChange={(e) => setWeightMax(e.target.value)}
              />
            </div>
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
                  />
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialogs / Sheet */}
      <AddKapaanDialog open={addKapaanOpen} onOpenChange={setAddKapaanOpen} />

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
    </>
  );
}

export const KapaanTable = memo(KapaanTableInner);
