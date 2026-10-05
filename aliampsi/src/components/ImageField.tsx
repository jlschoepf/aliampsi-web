'use client';

import { useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Area, Point } from 'react-easy-crop';
import { upload } from '@vercel/blob/client';

// El recortador solo se carga en el navegador (evita problemas de SSR).
const Cropper = dynamic(() => import('react-easy-crop'), { ssr: false }) as unknown as React.ComponentType<{
  image: string;
  crop: Point;
  zoom: number;
  aspect: number;
  onCropChange: (c: Point) => void;
  onZoomChange: (z: number) => void;
  onCropComplete: (area: Area, areaPixels: Area) => void;
  minZoom?: number;
  maxZoom?: number;
  restrictPosition?: boolean;
  objectFit?: string;
}>;

// value 0 = sin recortar: se sube la imagen entera (lo que conviene para flyers verticales).
const ASPECTS: { label: string; value: number }[] = [
  { label: 'Original (sin recortar)', value: 0 },
  { label: '4:3 (portadas)', value: 4 / 3 },
  { label: 'Horizontal 16:9', value: 16 / 9 },
  { label: 'Cuadrada', value: 1 },
  { label: 'Vertical', value: 3 / 4 },
];

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Para imágenes remotas (ya subidas), habilitar CORS para poder reprocesarlas.
    if (/^https?:\/\//i.test(url)) img.crossOrigin = 'anonymous';
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.src = url;
  });
}

async function getCroppedBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen.');
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  // Fondo blanco: evita el negro en imágenes con transparencia (logos) y
  // asegura que el recorte siempre quede sobre blanco.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    image,
    area.x, area.y, area.width, area.height,
    0, 0, area.width, area.height
  );
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen.'))),
      'image/jpeg',
      0.9
    );
  });
}

export function ImageField({
  label,
  name,
  defaultValue,
  hint,
  value: controlledValue,
  onChange,
  showHiddenInput = true,
  showUrlInput = true,
  aspectoInicial = 16 / 9,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  value?: string;
  onChange?: (v: string) => void;
  showHiddenInput?: boolean;
  showUrlInput?: boolean;
  /** Formato con el que arranca el recorte para imágenes horizontales (por defecto 16:9). */
  aspectoInicial?: number;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const controlled = controlledValue !== undefined;
  const value = controlled ? controlledValue : internalValue;
  const setValue = (v: string) => {
    if (controlled) onChange?.(v);
    else setInternalValue(v);
  };
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Estado del editor de encuadre
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(aspectoInicial);
  const [archivoOriginal, setArchivoOriginal] = useState<File | null>(null);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_a: Area, areaPx: Area) => {
    setAreaPixels(areaPx);
  }, []);

  async function uploadBlob(blob: Blob | File, fileName: string) {
    const result = await upload(fileName, blob, {
      access: 'public',
      handleUploadUrl: '/api/upload',
    });
    return result.url;
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    setError('');

    // SVG y GIF no se recortan (se subirían perdiendo formato/animación): van directo.
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      setStatus('uploading');
      uploadBlob(file, file.name)
        .then((url) => { setValue(url); setStatus('idle'); })
        .catch(() => {
          setStatus('error');
          setError('No se pudo subir la imagen. Configurá el almacenamiento (Vercel Blob) o pegá una URL.');
        });
      return;
    }

    // Abrir el editor de encuadre con la imagen elegida. Si es vertical o cuadrada (un flyer),
    // arranca en «Original» para no recortarla; si es horizontal, en «Horizontal».
    setArchivoOriginal(file);
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const im = new Image();
      im.onload = () => setAspect(im.naturalWidth / im.naturalHeight < 1.25 ? 0 : aspectoInicial);
      im.src = src;
      setImageSrc(src);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  }

  async function confirmCrop() {
    if (!imageSrc) return;
    if (aspect !== 0 && !areaPixels) return;
    setStatus('uploading');
    setError('');
    try {
      // «Original»: se sube el archivo tal cual (o la imagen ya cargada, si se está reeditando)
      const blob = aspect === 0
        ? (archivoOriginal ?? await (await fetch(imageSrc)).blob())
        : await getCroppedBlob(imageSrc, areaPixels as Area);
      const url = await uploadBlob(blob, `imagen-${Date.now()}.jpg`);
      setValue(url);
      setStatus('idle');
      setImageSrc(null);
    } catch {
      setStatus('error');
      setError('No se pudo procesar la imagen. Si estabas reeditando una imagen ya subida, volvé a subir el archivo.');
    }
  }

  function editCurrent() {
    if (!value) return;
    // SVG/GIF no pasan por el recortador (se perdería el formato).
    if (/\.svg($|\?)/i.test(value) || /\.gif($|\?)/i.test(value)) {
      setError('Este formato (SVG/GIF) no se recorta. Subí un archivo nuevo si querés cambiarlo.');
      return;
    }
    setError('');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setImageSrc(value);
  }

  function cancelCrop() {
    setImageSrc(null);
    setStatus('idle');
  }

  return (
    <div>
      <label className="field-label" htmlFor={`${name}-url`}>{label}</label>

      {value ? (
        <div className="mb-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-16 w-16 rounded-lg border border-line object-cover" />
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={editCurrent}
              className="text-sm font-medium text-teal-600 hover:text-coral"
            >
              Editar encuadre
            </button>
            <button
              type="button"
              onClick={() => setValue('')}
              className="text-sm font-medium text-coral hover:text-coral-dark"
            >
              Quitar imagen
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        {showUrlInput && (
          <input
            id={`${name}-url`}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Pegá una URL o subí un archivo"
            className="field"
          />
        )}
        <label className="btn-ghost shrink-0 cursor-pointer">
          {status === 'uploading' ? 'Subiendo…' : 'Subir archivo'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            disabled={status === 'uploading'}
          />
        </label>
      </div>

      {/* Valor que viaja en el formulario */}
      {showHiddenInput && <input type="hidden" name={name} value={value} />}

      {error && <p className="mt-1.5 text-xs text-coral-dark">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}

      {/* Editor de encuadre */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
          <div className="w-full max-w-lg rounded-xl2 bg-white p-4 shadow-xl sm:p-5">
            <h3 className="font-display text-lg font-bold text-ink">Encuadrar imagen</h3>
            <p className="mt-1 text-xs text-ink-muted">
              Arrastrá para mover y usá el zoom. Podés alejar para que entre todo el logo (lo que quede alrededor sale en blanco).
            </p>

            <div
              className="relative mt-4 h-72 w-full overflow-hidden rounded-lg sm:h-80"
              style={{
                backgroundColor: '#faf7f2',
                backgroundImage:
                  'linear-gradient(45deg,#e2dacc 25%,transparent 25%),linear-gradient(-45deg,#e2dacc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e2dacc 75%),linear-gradient(-45deg,transparent 75%,#e2dacc 75%)',
                backgroundSize: '22px 22px',
                backgroundPosition: '0 0,0 11px,11px -11px,-11px 0',
              }}
            >
              {aspect === 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageSrc} alt="Vista previa: se sube entera, sin recortar" className="absolute inset-0 h-full w-full object-contain" />
              ) : (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                minZoom={0.3}
                maxZoom={3}
                restrictPosition={false}
                objectFit="contain"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {ASPECTS.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => setAspect(a.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    aspect === a.value ? 'bg-ink text-paper' : 'border border-line text-ink hover:bg-sand'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-ink-muted">Zoom</label>
              <input
                type="range"
                min={0.3}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-coral"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelCrop}
                disabled={status === 'uploading'}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmCrop}
                disabled={status === 'uploading'}
                className="btn-primary disabled:opacity-60"
              >
                {status === 'uploading' ? 'Subiendo…' : (aspect === 0 ? 'Subir sin recortar' : 'Recortar y subir')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
