/**
    decode By Naqib
    see youu
**/
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const config = {
  api: { bodyParser: false },
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { status: false, message: 'Tiada fail dihantar' },
        { status: 400 }
      );
    }

    const MAX_SIZE = 4.5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { status: false, message: 'Fail terlalu besar. Maksimum 4.5MB' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const blob = await put(`megag88/${filename}`, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({
      status: true,
      creator: 'Mega88',
      message: 'Upload berjaya! 🎉',
      data: {
        filename: file.name,
        size: file.size,
        mimetype: file.type,
        url: blob.url,
      }
    });

  } catch (error) {
    return NextResponse.json(
      { status: false, message: error.message || 'Ralat server' },
      { status: 500 }
    );
  }
}
