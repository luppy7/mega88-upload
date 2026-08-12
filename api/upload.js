import { put } from '@vercel/blob';

export const config = {
  api: { bodyParser: false },
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ 
        status: false, 
        message: 'Tiada fail dihantar' 
      }), { status: 400 });
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}.${ext}`;

    const blob = await put(`megag88/${filename}`, imageBuffer, {
      access: 'public',
      contentType: file.type || 'image/jpeg',
    });

    return new Response(JSON.stringify({
      status: true,
      creator: 'Mega88',
      message: 'Upload berjaya! 🎉',
      data: {
        filename: file.name,
        size: file.size,
        url: blob.url,
      }
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({
      status: false,
      message: error.message || 'Ralat server'
    }), { status: 500 });
  }
}
