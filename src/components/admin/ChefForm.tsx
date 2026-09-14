"use client";

import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";

import { saveChefAction, type ChefInput } from "@/app/admin/actions";
import { Card, Field, FormActions, ImageField, inputClass } from "@/components/admin/fields";
import type { Chef, ChefSocialIcon, ChefStatIcon } from "@/lib/api";

const STAT_ICONS: ChefStatIcon[] = ["experience", "recipes", "students", "passion"];
const SOCIAL_ICONS: ChefSocialIcon[] = ["instagram", "youtube", "pinterest"];

export function ChefForm({ initialData }: { initialData: Chef }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { id, ...rest } = initialData;
  void id;
  const [form, setForm] = useState<ChefInput>({
    ...rest,
    longBio: rest.longBio?.length ? rest.longBio : [""],
    specialities: rest.specialities ?? [],
    stats: rest.stats ?? [],
    socials: rest.socials ?? [],
  });
  // Specialities are edited as one comma-separated line.
  const [specialities, setSpecialities] = useState((rest.specialities ?? []).join(", "));

  const set = <K extends keyof ChefInput>(key: K, value: ChefInput[K]) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    const payload: ChefInput = {
      ...form,
      longBio: form.longBio.map((p) => p.trim()).filter(Boolean),
      specialities: specialities.split(",").map((s) => s.trim()).filter(Boolean),
      stats: form.stats.filter((s) => s.value.trim() && s.label.trim()),
      socials: form.socials.filter((s) => s.href.trim()),
    };
    startTransition(async () => {
      const result = await saveChefAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card title="Identity">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Name">
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Title">
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Founder & Head Pastry Chef" className={inputClass} />
          </Field>
        </div>
        <Field label="Tagline" hint="One line under the name on /chef.">
          <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Short bio" hint="Home page 'Meet your instructor' and course pages.">
          <textarea rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} className={inputClass} />
        </Field>
      </Card>

      <Card title="Full biography — /chef page">
        {form.longBio.map((paragraph, index) => (
          <div key={index} className="flex gap-2">
            <textarea
              rows={3}
              value={paragraph}
              onChange={(e) => set("longBio", form.longBio.map((p, i) => (i === index ? e.target.value : p)))}
              placeholder={`Paragraph ${index + 1}`}
              className={inputClass}
            />
            {form.longBio.length > 1 && (
              <button type="button" onClick={() => set("longBio", form.longBio.filter((_, i) => i !== index))} aria-label="Remove paragraph" className="text-muted hover:text-red-600 self-start p-2">
                <X className="size-4" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => set("longBio", [...form.longBio, ""])} className="text-forest inline-flex items-center gap-1.5 text-[0.85rem] font-medium">
          <Plus className="size-4" />
          Add paragraph
        </button>
        <Field label="Specialities" hint="Comma separated, e.g. Chocolate & cakes, French pastry">
          <input value={specialities} onChange={(e) => { setSaved(false); setSpecialities(e.target.value); }} className={inputClass} />
        </Field>
      </Card>

      <Card title="Photo">
        <div className="max-w-xs">
          <ImageField
            label="Portrait"
            hint="Leave empty to keep the current studio photo."
            value={form.portrait}
            onChange={(url) => set("portrait", url)}
            aspect="aspect-square"
          />
        </div>
      </Card>

      <Card title="Stats">
        {form.stats.map((stat, index) => (
          <div key={index} className="grid items-end gap-3 sm:grid-cols-[1fr_2fr_1fr_auto]">
            <Field label="Value">
              <input value={stat.value} onChange={(e) => set("stats", form.stats.map((s, i) => (i === index ? { ...s, value: e.target.value } : s)))} placeholder="10+ Years" className={inputClass} />
            </Field>
            <Field label="Label">
              <input value={stat.label} onChange={(e) => set("stats", form.stats.map((s, i) => (i === index ? { ...s, label: e.target.value } : s)))} placeholder="Professional Experience" className={inputClass} />
            </Field>
            <Field label="Icon">
              <select value={stat.icon} onChange={(e) => set("stats", form.stats.map((s, i) => (i === index ? { ...s, icon: e.target.value as ChefStatIcon } : s)))} className={inputClass}>
                {STAT_ICONS.map((icon) => (
                  <option key={icon}>{icon}</option>
                ))}
              </select>
            </Field>
            <button type="button" onClick={() => set("stats", form.stats.filter((_, i) => i !== index))} aria-label="Remove stat" className="text-muted hover:text-red-600 p-3">
              <X className="size-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => set("stats", [...form.stats, { value: "", label: "", icon: "experience" }])} className="text-forest inline-flex items-center gap-1.5 text-[0.85rem] font-medium">
          <Plus className="size-4" />
          Add stat
        </button>
      </Card>

      <Card title="Social links">
        {form.socials.map((social, index) => (
          <div key={index} className="grid items-end gap-3 sm:grid-cols-[1fr_3fr_auto]">
            <Field label="Platform">
              <select
                value={social.icon}
                onChange={(e) => {
                  const icon = e.target.value as ChefSocialIcon;
                  set("socials", form.socials.map((s, i) => (i === index ? { ...s, icon, label: icon[0].toUpperCase() + icon.slice(1) } : s)));
                }}
                className={inputClass}
              >
                {SOCIAL_ICONS.map((icon) => (
                  <option key={icon}>{icon}</option>
                ))}
              </select>
            </Field>
            <Field label="URL">
              <input type="url" value={social.href} onChange={(e) => set("socials", form.socials.map((s, i) => (i === index ? { ...s, href: e.target.value } : s)))} placeholder="https://instagram.com/…" className={inputClass} />
            </Field>
            <button type="button" onClick={() => set("socials", form.socials.filter((_, i) => i !== index))} aria-label="Remove link" className="text-muted hover:text-red-600 p-3">
              <X className="size-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => set("socials", [...form.socials, { label: "Instagram", href: "", icon: "instagram" }])} className="text-forest inline-flex items-center gap-1.5 text-[0.85rem] font-medium">
          <Plus className="size-4" />
          Add link
        </button>
      </Card>

      <FormActions pending={pending} error={error} saved={saved} saveLabel="Save profile" />
    </form>
  );
}
