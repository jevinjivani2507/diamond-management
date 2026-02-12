"use client";

import { memo, useCallback, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDiamondStore } from "@/lib/store";

interface AddPersonInlineProps {
  onPersonAdded?: (personId: string) => void;
  label?: string;
}

function AddPersonInlineInner({ onPersonAdded, label }: AddPersonInlineProps) {
  const addPerson = useDiamondStore((s) => s.addPerson);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      const person = addPerson(name.trim(), phone.trim() || undefined);
      onPersonAdded?.(person.id);
      setName("");
      setPhone("");
      setOpen(false);
    },
    [name, phone, addPerson, onPersonAdded]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {label ? (
          <Button type="button" variant="outline" className="gap-1.5">
            <Plus className="size-4" />
            {label}
          </Button>
        ) : (
          <Button type="button" variant="outline" size="icon" className="shrink-0">
            <Plus className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Person</DialogTitle>
          <DialogDescription>Add a new person to the list.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="personName">Name</Label>
            <Input
              id="personName"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="personPhone">Phone (optional)</Label>
            <Input
              id="personPhone"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const AddPersonInline = memo(AddPersonInlineInner);
