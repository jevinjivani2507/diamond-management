"use client";

import { memo, useCallback, useState } from "react";
import {
  CalendarDays,
  Diamond,
  FlaskConical,
  Hash,
  Palette,
  Sparkles,
  Weight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useDiamondStore } from "@/lib/store";
import { DatePicker } from "@/components/date-picker";

const PURITIES = [
  "IF",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
  "SI2",
  "I1",
  "I2",
] as const;

const COLORS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"] as const;

const LABS = ["IGI", "GIA"] as const;

interface AddReceiveDialogProps {
  kapaanId: string;
  kapaanNo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddReceiveDialogInner({
  kapaanId,
  kapaanNo,
  open,
  onOpenChange,
}: AddReceiveDialogProps) {
  const addReceive = useDiamondStore((s) => s.addReceive);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shape, setShape] = useState("");
  const [pcs, setPcs] = useState("");
  const [weight, setWeight] = useState("");
  const [purity, setPurity] = useState("");
  const [color, setColor] = useState("");
  const [lab, setLab] = useState("");

  const resetForm = useCallback(() => {
    setDate(new Date().toISOString().slice(0, 10));
    setShape("");
    setPcs("");
    setWeight("");
    setPurity("");
    setColor("");
    setLab("");
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!date || !shape || !pcs || !weight || !purity || !color || !lab)
        return;

      addReceive({
        kapaanId,
        date,
        shape,
        pcs: Number(pcs),
        weight: Number(weight),
        purity,
        color,
        lab: lab as "IGI" | "GIA",
      });

      resetForm();
      onOpenChange(false);
    },
    [
      kapaanId,
      date,
      shape,
      pcs,
      weight,
      purity,
      color,
      lab,
      addReceive,
      resetForm,
      onOpenChange,
    ]
  );

  const handleOpenChange = useCallback(
    (val: boolean) => {
      if (!val) resetForm();
      onOpenChange(val);
    },
    [resetForm, onOpenChange]
  );

  const isValid = date && shape && pcs && weight && purity && color && lab;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        {/* Header with accent background */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-b px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Diamond className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base">Add Receive</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Kapaan{" "}
                  <span className="font-semibold text-foreground">
                    {kapaanNo}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
          <div className="space-y-5">
            {/* Date & Lab — 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <CalendarDays className="inline size-3.5 mr-1 -mt-0.5" />
                  Date
                </Label>
                <DatePicker
                  value={date}
                  onChange={setDate}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <FlaskConical className="inline size-3.5 mr-1 -mt-0.5" />
                  Lab
                </Label>
                <Select value={lab} onValueChange={setLab}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select lab" />
                  </SelectTrigger>
                  <SelectContent>
                    {LABS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Shape & Pcs — 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="receiveShape"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  <Diamond className="inline size-3.5 mr-1 -mt-0.5" />
                  Shape
                </Label>
                <Input
                  id="receiveShape"
                  placeholder="e.g. Round, Oval"
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="receivePcs"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  <Hash className="inline size-3.5 mr-1 -mt-0.5" />
                  Pcs
                </Label>
                <Input
                  id="receivePcs"
                  type="number"
                  placeholder="e.g. 10"
                  value={pcs}
                  onChange={(e) => setPcs(e.target.value)}
                  className="h-10"
                  min={1}
                  required
                />
              </div>
            </div>

            {/* Weight, Purity, Color — 3 columns */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="receiveWeight"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  <Weight className="inline size-3.5 mr-1 -mt-0.5" />
                  Weight
                </Label>
                <Input
                  id="receiveWeight"
                  type="number"
                  step="0.01"
                  placeholder="ct"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="h-10"
                  min={0}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <Sparkles className="inline size-3.5 mr-1 -mt-0.5" />
                  Purity
                </Label>
                <Select value={purity} onValueChange={setPurity}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {PURITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <Palette className="inline size-3.5 mr-1 -mt-0.5" />
                  Color
                </Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid} className="min-w-[120px]">
              Add Receive
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const AddReceiveDialog = memo(AddReceiveDialogInner);
