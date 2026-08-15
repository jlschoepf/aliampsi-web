export function OrderArrows({
  action,
  id,
  isFirst,
  isLast,
}: {
  action: (formData: FormData) => void;
  id: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex flex-col">
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="up" />
        <button
          type="submit"
          disabled={isFirst}
          aria-label="Subir"
          className="flex h-5 w-5 items-center justify-center rounded text-ink-muted hover:bg-sand hover:text-ink disabled:pointer-events-none disabled:opacity-25"
        >
          ▲
        </button>
      </form>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="down" />
        <button
          type="submit"
          disabled={isLast}
          aria-label="Bajar"
          className="flex h-5 w-5 items-center justify-center rounded text-ink-muted hover:bg-sand hover:text-ink disabled:pointer-events-none disabled:opacity-25"
        >
          ▼
        </button>
      </form>
    </div>
  );
}
