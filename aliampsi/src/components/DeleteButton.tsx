'use client';

type Props = {
  action: (formData: FormData) => void;
  id: string;
  label?: string;
  confirmText?: string;
};

export function DeleteButton({ action, id, label = 'Eliminar', confirmText }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText || '¿Seguro que querés eliminar este elemento? Esta acción no se puede deshacer.')) {
          e.preventDefault();
        }
      }}
      className="inline"
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm font-medium text-coral hover:text-coral-dark">
        {label}
      </button>
    </form>
  );
}
