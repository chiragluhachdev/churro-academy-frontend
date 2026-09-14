"use client";

import { ArrowDown, ArrowUp, ChevronDown, Eye, Film, Link2, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { uploadFile } from "@/components/admin/upload";
import { inputClass } from "@/components/admin/fields";
import { cn } from "@/lib/format";
import { formatMinutes, resolveVideo } from "@/lib/video";
import type { CurriculumLesson, CurriculumModule } from "@/types/course";

const newId = () => crypto.randomUUID();

export function emptyLesson(): CurriculumLesson {
  return { id: newId(), title: "", duration: 0, preview: false, videoUrl: "", description: "" };
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/**
 * Sections and lessons. Ids are created here and kept on every save, which is
 * what lets a student's progress survive the admin reordering or renaming a
 * lesson.
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
  const [open, setOpen] = useState<string | null>(null);
  const totalLessons = value.reduce((n, s) => n + s.lessons.length, 0);
  const totalMinutes = value.reduce((n, s) => n + s.lessons.reduce((m, l) => m + (Number(l.duration) || 0), 0), 0);
  const withVideo = value.reduce((n, s) => n + s.lessons.filter((l) => l.videoUrl).length, 0);

  const setSection = (i: number, patch: Partial<CurriculumModule>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const setLesson = (si: number, li: number, patch: Partial<CurriculumLesson>) =>
    setSection(si, { lessons: value[si].lessons.map((l, idx) => (idx === li ? { ...l, ...patch } : l)) });

  return (
    <div className="space-y-4">
      <div className="bg-cream flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl px-4 py-3 text-[0.82rem]">
        <span className="text-ink font-medium">{value.length} sections</span>
        <span className="text-ink font-medium">{totalLessons} lessons</span>
        <span className="text-muted">{withVideo} with video</span>
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
                if (section.lessons.length && !window.confirm(`Delete "${section.title || "this section"}" and its ${section.lessons.length} lessons? Students lose progress on them.`)) return;
                onChange(value.filter((_, idx) => idx !== si));
              }}
            >
              <Trash2 className="size-4" />
            </IconButton>
          </div>

          <ul className="divide-line/40 divide-y">
            {section.lessons.map((lesson, li) => {
              const expanded = open === lesson.id;
              return (
                <li key={lesson.id}>
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <span className="text-muted w-9 shrink-0 text-[0.78rem]">{si + 1}.{li + 1}</span>
                    <input
                      value={lesson.title}
                      onChange={(e) => setLesson(si, li, { title: e.target.value })}
                      placeholder="Lesson title"
                      aria-label={`Lesson ${si + 1}.${li + 1} title`}
                      className="text-ink placeholder:text-muted/60 min-w-0 flex-1 bg-transparent py-1 text-[0.9rem] outline-none"
                    />
                    {lesson.videoUrl ? <Film className="text-forest size-4 shrink-0" aria-label="Has video" /> : <Film className="text-line size-4 shrink-0" aria-label="No video" />}
                    {lesson.preview && <span className="bg-gold/20 text-ink rounded-full px-2 py-0.5 text-[0.65rem] font-medium">Preview</span>}
                    <IconButton label="Move lesson up" onClick={() => setSection(si, { lessons: move(section.lessons, li, li - 1) })} disabled={li === 0}><ArrowUp className="size-3.5" /></IconButton>
                    <IconButton label="Move lesson down" onClick={() => setSection(si, { lessons: move(section.lessons, li, li + 1) })} disabled={li === section.lessons.length - 1}><ArrowDown className="size-3.5" /></IconButton>
                    <IconButton label={expanded ? "Collapse lesson" : "Edit lesson details"} onClick={() => setOpen(expanded ? null : lesson.id)}>
                      <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
                    </IconButton>
                    <IconButton label="Delete lesson" danger onClick={() => setSection(si, { lessons: section.lessons.filter((_, idx) => idx !== li) })}><Trash2 className="size-3.5" /></IconButton>
                  </div>

                  {expanded && (
                    <div className="bg-cream-warm/60 space-y-4 px-4 pt-2 pb-5 sm:pl-15">
                      <VideoInput value={lesson.videoUrl ?? ""} onChange={(url) => setLesson(si, li, { videoUrl: url })} />
                      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                        <label className="block space-y-1.5">
                          <span className="text-ink block text-[0.8rem] font-medium">Duration (minutes)</span>
                          <input type="number" min={0} value={lesson.duration || ""} onChange={(e) => setLesson(si, li, { duration: Number(e.target.value) })} className={inputClass} />
                        </label>
                        <label className="flex cursor-pointer items-start gap-2.5 self-end pb-2.5 select-none">
                          <input type="checkbox" checked={Boolean(lesson.preview)} onChange={(e) => setLesson(si, li, { preview: e.target.checked })} className="accent-forest mt-0.5 size-4" />
                          <span>
                            <span className="text-ink flex items-center gap-1.5 text-[0.85rem] font-medium"><Eye className="size-3.5" /> Free preview</span>
                            <span className="text-muted block text-[0.72rem]">Anyone can watch this one, before buying.</span>
                          </span>
                        </label>
                      </div>
                      <label className="block space-y-1.5">
                        <span className="text-ink block text-[0.8rem] font-medium">Lesson notes</span>
                        <textarea rows={3} value={lesson.description ?? ""} onChange={(e) => setLesson(si, li, { description: e.target.value })} placeholder="Ingredients, key steps, tips — shown under the video." className={inputClass} />
                      </label>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => {
              const lesson = emptyLesson();
              setSection(si, { lessons: [...section.lessons, lesson] });
              setOpen(lesson.id);
            }}
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
      className={cn("shrink-0 rounded-lg p-1.5 transition-colors disabled:opacity-25", danger ? "text-muted hover:bg-red-50 hover:text-red-600" : "text-muted hover:bg-forest/10 hover:text-ink")}
    >
      {children}
    </button>
  );
}

function VideoInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const source = resolveVideo(value);

  async function handle(file?: File) {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      onChange(await uploadFile(file, "video", setProgress));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <span className="text-ink block text-[0.8rem] font-medium">Video</span>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Link2 className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste a YouTube, Vimeo or video link — or upload"
            className={cn(inputClass, "pl-9 text-[0.82rem]")}
            disabled={progress !== null}
          />
        </div>
        {value && progress === null && (
          <button type="button" onClick={() => onChange("")} aria-label="Remove video" className="text-muted hover:text-red-600 shrink-0 rounded-xl px-2">
            <X className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={progress !== null}
          className="border-line/60 bg-cream hover:bg-forest/5 inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 text-[0.82rem] font-medium transition-colors disabled:opacity-60"
        >
          {progress !== null ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {progress !== null ? `${progress}%` : "Upload"}
        </button>
        <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => void handle(e.target.files?.[0])} />
      </div>
      {progress !== null && (
        <div className="bg-line/70 h-1 overflow-hidden rounded-full">
          <div className="bg-forest h-full transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error ? (
        <p className="text-[0.75rem] text-red-600">{error}</p>
      ) : value ? (
        <p className={cn("text-[0.72rem]", source.kind === "none" ? "text-red-600" : "text-forest")}>
          {source.kind === "youtube" ? "YouTube video — plays in the lesson" : source.kind === "vimeo" ? "Vimeo video — plays in the lesson" : source.kind === "file" ? "Video file — plays in the lesson" : "This doesn't look like a video link"}
        </p>
      ) : (
        <p className="text-muted text-[0.72rem]">Uploads up to 100 MB. For longer videos, use YouTube (unlisted) or Vimeo.</p>
      )}
    </div>
  );
}
