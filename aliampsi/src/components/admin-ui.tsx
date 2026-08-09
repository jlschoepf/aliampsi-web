'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';

export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  required,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>
        {label} {required && <span className="text-coral">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className="field"
      />
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  required,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>
        {label} {required && <span className="text-coral">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className="field"
      />
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="field">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-line text-coral focus:ring-coral"
      />
      {label}
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? 'Guardando…' : children}
    </button>
  );
}

export function Badge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        published ? 'bg-teal-600/10 text-teal-700' : 'bg-ink/5 text-ink-muted'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', published ? 'bg-teal-600' : 'bg-ink-muted')} />
      {published ? 'Publicado' : 'Borrador'}
    </span>
  );
}
