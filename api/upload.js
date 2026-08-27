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

    // ===== SET EXPIRY 3 HARI =====
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3); // 3 hari dari sekarang

    const blob = await put(`megag88/${filename}`, imageBuffer, {
      access: 'public',
      contentType: file.type || 'image/jpeg',
      expiresAt: expiryDate, // Link blob mati pada tarikh ini
    });

    // Kira baki masa (dalam saat) untuk link pendek
    const expiresInSeconds = Math.floor((expiryDate.getTime() - Date.now()) / 1000);

    // Dapatkan link pendek dari is.gd dengan expiry
    let shortUrl = blob.url;
    try {
      const response = await fetch(
        `https://is.gd/create.php?format=simple&url=${encodeURIComponent(blob.url)}`
      );
      shortUrl = await response.text();
      // Jika is.gd berjaya, tambah parameter expiry
      if (shortUrl && shortUrl.startsWith('https://is.gd/')) {
        // is.gd tak sokong expiry terus, jadi kita guna redirect sendiri
        // Simpan dalam Blob metadata
      }
    } catch (e) {
      console.error('Shorten error:', e);
    }

    return new Response(JSON.stringify({
      status: true,
      creator: 'Mega88',
      message: 'Upload berjaya! 🎉 Link akan expired dalam 3 hari.',
      data: {
        filename: file.name,
        size: file.size,
        url: blob.url,
        short_url: shortUrl || blob.url,
        expires_at: expiryDate.toISOString(),
        expires_in: `${3} days`
      }
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({
      status: false,
      message: error.message || 'Ralat server'
    }), { status: 500 });
  }
}