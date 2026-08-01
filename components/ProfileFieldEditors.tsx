"use client";

import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, Plus } from "lucide-react";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Chip list editor for simple string arrays (certifications, personality
// traits, benefits, pets, "can teach", etc.) — shared by the AuPair and
// Family single-page profile editors.
export function TagListEditor({
  values,
  onChange,
  placeholder,
  badgeClassName = "rounded-full bg-orange-100 px-3 py-1 text-orange-800 hover:bg-orange-100",
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  badgeClassName?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <Badge key={`${v}-${i}`} className={`${badgeClassName} gap-1 pr-1`}>
            {v}
            <button type="button" onClick={() => remove(v)} className="ml-1 rounded-full p-0.5 hover:bg-black/10">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {values.length === 0 ? <p className="text-sm text-gray-500">None added yet.</p> : null}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function DayPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (day: string) => {
    onChange(selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_DAYS.map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => toggle(day)}
          className={`rounded-full border px-3 py-1.5 text-sm transition ${
            selected.includes(day)
              ? "border-orange-400 bg-orange-100 text-orange-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50"
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  );
}

export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      {children}
    </div>
  );
}
