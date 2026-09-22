"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { inputClass } from "@/components/admin/fields";
import { cn, formatMinutes } from "@/lib/format";
import type { CurriculumLesson, CurriculumModule } from "@/types/course";

const newId = () => crypto.randomUUID();

export function emptyLesson(): CurriculumLesson {
  return { id: newId(), title: "", duration: 0 };
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/**
 * The syllabus shown on the course page — sections and lesson titles with a
 * duration each. There's no in-app player, so this is marketing copy, not
 * something progress is tracked against; ids just keep reordering painless.
 * The actual recordings live in one Drive link per course, set under
 * "Course delivery" below — not here, per lesson.
 */
export function CurriculumEditor({
  value,
  onChange,
  onUseDuration,
}: {
  value: CurriculumModule[];
  onChange: (next: CurriculumModule[]) => void;
  onUseDuration: (label: string) => void;
}) {
  const totalLessons = value.reduce((n, s) => n + s.lessons.length, 0);
  const totalMinutes = value.reduce((n, s) => n + s.lessons.reduce((m, l) => m + (Number(l.duration) || 0), 0), 0);

  const setSection = (i: number, patch: Partial<CurriculumModule>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const setLesson = (si: number, li: number, patch: Partial<CurriculumLesson>) =>
    setSection(si, { lessons: value[si].lessons.map((l, idx) => (idx === li ? { ...l, ...patch } : l)) });

  return (
    <div className="space-y-4">
      <div className="bg-cream flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl px-4 py-3 text-[0.82rem]">
        <span className="text-ink font-medium">{value.length} sections</span>
        <span className="text-ink font-medium">{totalLessons} lessons</span>
        <span className="text-muted">{formatMinutes(totalMinutes) || "0m"} total</span>
        {totalMinutes > 0 && (
          <button type="button" onClick={() => onUseDuration(formatMinutes(totalMinutes))} className="text-forest ml-auto font-medium hover:underline">
            Use as course duration
          </button>
        )}
      </div>

      {value.map((section, si) => (
        <div key={section.id} className="border-line/60 bg-cream overflow-hidden rounded-2xl border">
          <div className="bg-forest/5 flex items-center gap-2 px-4 py-3">
            <span className="text-muted w-6 text-[0.8rem] font-semibold">{si + 1}.</span>
            <input
              value={section.title}
              onChange={(e) => setSection(si, { title: e.target.value })}
              placeholder="Section title, e.g. Foundations"
              aria-label={`Section ${si + 1} title`}
              className="text-ink placeholder:text-muted/60 min-w-0 flex-1 bg-transparent py-1 text-[0.95rem] font-semibold outline-none"
            />
            <span className="text-muted hidden text-[0.75rem] sm:inline">{section.lessons.length} lessons</span>
            <IconButton label="Move section up" onClick={() => onChange(move(value, si, si - 1))} disabled={si === 0}><ArrowUp className="size-4" /></IconButton>
            <IconButton label="Move section down" onClick={() => onChange(move(value, si, si + 1))} disabled={si === value.length - 1}><ArrowDown className="size-4" /></IconButton>
            <IconButton
              label="Delete section"
              danger
              onClick={() => {
                if (section.lessons.length && !window.confirm(`Delete "${section.title || "this section"}" and its ${section.lessons.length} lessons?`)) return;
                onChange(value.filter((_, idx) => idx !== si));
              }}
            >
              <Trash2 className="size-4" />
            </IconButton>
          </div>

          <ul className="divide-line/40 divide-y">
            {section.lessons.map((lesson, li) => (
              <li key={lesson.id} className="flex items-center gap-2 px-4 py-2.5">
                <span className="text-muted w-9 shrink-0 text-[0.78rem]">{si + 1}.{li + 1}</span>
                <input
                  value={lesson.title}
                  onChange={(e) => setLesson(si, li, { title: e.target.value })}
                  placeholder="Lesson title"
                  aria-label={`Lesson ${si + 1}.${li + 1} title`}
                  className="text-ink placeholder:text-muted/60 min-w-0 flex-1 bg-transparent py-1 text-[0.9rem] outline-none"
                />
                <input
                  type="number"
                  min={0}
                  value={lesson.duration || ""}
                  onChange={(e) => setLesson(si, li, { duration: Number(e.target.value) })}
                  placeholder="min"
                  aria-label={`Lesson ${si + 1}.${li + 1} duration in minutes`}
                  className={`${inputClass} w-20 shrink-0 py-1.5 text-center text-[0.82rem]`}
                />
                <IconButton label="Move lesson up" onClick={() => setSection(si, { lessons: move(section.lessons, li, li - 1) })} disabled={li === 0}><ArrowUp className="size-3.5" /></IconButton>
                <IconButton label="Move lesson down" onClick={() => setSection(si, { lessons: move(section.lessons, li, li + 1) })} disabled={li === section.lessons.length - 1}><ArrowDown className="size-3.5" /></IconButton>
                <IconButton label="Delete lesson" danger onClick={() => setSection(si, { lessons: section.lessons.filter((_, idx) => idx !== li) })}><Trash2 className="size-3.5" /></IconButton>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setSection(si, { lessons: [...section.lessons, emptyLesson()] })}
            className="text-forest hover:bg-forest/5 flex w-full items-center gap-1.5 px-4 py-3 text-[0.85rem] font-medium transition-colors"
          >
            <Plus className="size-4" />
            Add lesson
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...value, { id: newId(), title: "", lessons: [emptyLesson()] }])}
        className="border-line hover:border-forest/40 text-forest flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-4 text-[0.9rem] font-medium transition-colors"
      >
        <Plus className="size-4" />
        Add section
      </button>
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "shrink-0 rounded-lg p-1.5 transition-colors disabled:opacity-25",
        danger ? "text-muted hover:bg-red-50 hover:text-red-600" : "text-muted hover:bg-forest/10 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
