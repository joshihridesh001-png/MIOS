import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

const ALLOWED_MIME_TYPES = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided in form data.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type (${file.type || 'unknown'}). Allowed formats: PNG, JPEG, WEBP, GIF, MP4, WEBM, MOV.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 50 MB limit.`,
        },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'creatives');
    await mkdir(uploadsDir, { recursive: true });

    const sanitizedBase = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeName = `${Date.now()}-${sanitizedBase}`;
    const destinationPath = path.join(uploadsDir, safeName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(destinationPath, buffer);

    return NextResponse.json({
      url: `/uploads/creatives/${safeName}`,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      isVideo: file.type.startsWith('video/'),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected upload error';
    return NextResponse.json(
      { error: `Failed to store creative asset: ${message}` },
      { status: 500 }
    );
  }
}
