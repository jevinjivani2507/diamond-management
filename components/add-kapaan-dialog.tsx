"use client";

import { memo, useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDiamondStore, selectPersons } from "@/lib/store";
import { AddPersonInline } from "@/components/add-person-inline";

interface AddKapaanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddKapaanDialogInner({ open, onOpenChange }: AddKapaanDialogProps) {
  const persons = useDiamondStore(selectPersons);
  const addKapaan = useDiamondStore((s) => s.addKapaan);

  const [kapaanNo, setKapaanNo] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pcs, setPcs] = useState("");
  const [weight, setWeight] = useState("");
  const [personId, setPersonId] = useState("");

  const resetForm = useCallback(() => {
    setKapaanNo("");
    setDate(new Date().toISOString().slice(0, 10));
    setPcs("");
    setWeight("");
    setPersonId("");
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!kapaanNo || !date || !pcs || !weight || !personId) return;

      addKapaan({
        kapaanNo,
        date,
        pcs: Number(pcs),
        weight: Number(weight),
        personId,
      });

      resetForm();
      onOpenChange(false);
    },
    [kapaanNo, date, pcs, weight, personId, addKapaan, resetForm, onOpenChange]
  );

  const handleOpenChange = useCallback(
    (val: boolean) => {
      if (!val) resetForm();
      onOpenChange(val);
    },
    [resetForm, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Kapaan</DialogTitle>
          <DialogDescription>Enter the kapaan details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="kapaanNo">Kapaan No.</Label>
              <Input
                id="kapaanNo"
                placeholder="e.g. KPN-006"
                value={kapaanNo}
                onChange={(e) => setKapaanNo(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kapaanDate">Date</Label>
              <Input
                id="kapaanDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pcs">Pcs</Label>
              <Input
                id="pcs"
                type="number"
                placeholder="Pieces"
                value={pcs}
                onChange={(e) => setPcs(e.target.value)}
                min={1}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weight">Weight (ct)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                placeholder="Weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min={0}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Person</Label>ß{" "}
            {persons.length === 0 ? (
              <div className="flex flex-col items-center gap-2.5 rounded-lg border border-dashed p-5">
                <p className="text-sm text-muted-foreground">
                  No persons added yet
                </p>
                <AddPersonInline
                  onPersonAdded={setPersonId}
                  label="Add Person"
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <Select value={personId} onValueChange={setPersonId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {persons.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AddPersonInline onPersonAdded={setPersonId} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Kapaan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const AddKapaanDialog = memo(AddKapaanDialogInner);
