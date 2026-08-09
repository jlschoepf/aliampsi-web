import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// Subida directa del navegador a Vercel Blob.
// La app solo genera un token de subida y únicamente para administradores.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getSession();
        if (!session) throw new Error('No autorizado');
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg+xml',
          ],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5 MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Se ejecuta en producción cuando la subida termina. Sin acción extra.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
