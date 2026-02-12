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
import { useDiamondStore, selectPersons, type Kapaan } from "@/lib/store";
import { AddPersonInline } from "@/components/add-person-inline";
import { DatePicker } from "@/components/date-picker";

interface AddKapaanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a kapaan to switch to edit mode */
  kapaan?: Kapaan | null;
}

function AddKapaanDialogInner({
  open,
  onOpenChange,
  kapaan,
}: AddKapaanDialogProps) {
  const persons = useDiamondStore(selectPersons);
  const addKapaan = useDiamondStore((s) => s.addKapaan);
  const updateKapaan = useDiamondStore((s) => s.updateKapaan);

  const isEdit = !!kapaan;

  const [kapaanNo, setKapaanNo] = useState(kapaan?.kapaanNo ?? "");
  const [date, setDate] = useState(
    kapaan?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [pcs, setPcs] = useState(kapaan ? String(kapaan.pcs) : "");
  const [weight, setWeight] = useState(kapaan ? String(kapaan.weight) : "");
  const [personId, setPersonId] = useState(kapaan?.personId ?? "");

  const resetForm = useCallback(() => {
    setKapaanNo("");
    setDate(new Date().toISOString().slice(0, 10));
    setPcs("");
    setWeight("");
    setPersonId("");
  }, []);

  const submitWithPerson = useCallback(
    (pid: string) => {
      if (!kapaanNo || !date || !pcs || !weight || !pid) return;

      if (isEdit && kapaan) {
        updateKapaan(kapaan.id, {
          kapaanNo,
          date,
          pcs: Number(pcs),
          weight: Number(weight),
          personId: pid,
        });
      } else {
        addKapaan({
          kapaanNo,
          date,
          pcs: Number(pcs),
          weight: Number(weight),
          personId: pid,
        });
      }

      resetForm();
      onOpenChange(false);
    },
    [
      kapaanNo,
      date,
      pcs,
      weight,
      isEdit,
      kapaan,
      addKapaan,
      updateKapaan,
      resetForm,
      onOpenChange,
    ]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      submitWithPerson(personId);
    },
    [personId, submitWithPerson]
  );

  const handleOpenChange = useCallback(
    (val: boolean) => {
      if (!val) resetForm();
      onOpenChange(val);
    },
    [resetForm, onOpenChange]
  );

  /** Called from AddPersonInline's "Add & Submit Kapaan" button */
  const handleAddAndSubmitParent = useCallback(
    (newPersonId: string) => {
      submitWithPerson(newPersonId);
    },
    [submitWithPerson]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Kapaan" : "Add New Kapaan"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update the details for ${kapaan?.kapaanNo}.`
              : "Enter the kapaan details below."}
          </DialogDescription>
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
              <Label>Date</Label>
              <DatePicker value={date} onChange={setDate} />
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
            <Label>Person</Label>
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
            <Button type="submit">
              {isEdit ? "Save Changes" : "Add Kapaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const AddKapaanDialog = memo(AddKapaanDialogInner);
