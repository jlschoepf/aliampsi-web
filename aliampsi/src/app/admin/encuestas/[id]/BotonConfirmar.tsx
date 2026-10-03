'use client';
export function BotonConfirmar({ form, texto, aviso }: { form: string; texto: string; aviso: string }) {
  return (
    <button type="submit" form={form} className="btn-ghost" onClick={(e) => { if (!confirm(aviso)) e.preventDefault(); }}>
      {texto}
    </button>
  );
}
