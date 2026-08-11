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

    const blob = await put(`megag88/${Date.now()}-${file.name}`, file, {
      access: 'public',
      contentType: file.type,
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
      message: error.message 
    }), { status: 500 });
  }
}
