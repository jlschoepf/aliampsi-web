export function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-lg border border-line bg-sand/20 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3 text-sm font-semibold text-ink hover:text-coral">
        <span>{title}</span>
        <span className="text-xs text-ink-muted transition-transform group-open:rotate-90">▶</span>
      </summary>
      <div className="space-y-4 border-t border-line px-4 pb-4 pt-4">{children}</div>
    </details>
  );
}
