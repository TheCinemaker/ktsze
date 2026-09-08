const BUCKET = 'newsletter-images';
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const { fileName, contentType, data } = JSON.parse(event.body || '{}');
    const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
    const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

    if (!supabaseUrl || !anonKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Hiányzik a VITE_SUPABASE_URL vagy VITE_SUPABASE_ANON_KEY Netlify környezeti változó.' }) };
    }
    if (!ALLOWED_TYPES.has(contentType)) return { statusCode: 400, body: JSON.stringify({ error: 'Csak JPG, PNG vagy WebP kép tölthető fel.' }) };
    if (!data || typeof data !== 'string') return { statusCode: 400, body: JSON.stringify({ error: 'Hiányzik a kép adata.' }) };

    const buffer = Buffer.from(data, 'base64');
    if (buffer.length > MAX_BYTES) return { statusCode: 400, body: JSON.stringify({ error: 'A kép legfeljebb 4 MB lehet.' }) };

    const ext = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1];
    const safeBase = String(fileName || 'flyer')
      .replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 60) || 'flyer';
    const path = `flyers/${Date.now()}-${safeBase}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const headers = {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      'Content-Type': contentType,
      'x-upsert': 'false'
    };

    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${BUCKET}/${encodeURIComponent(path)}`,
      { method: 'POST', headers, body: buffer }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return { statusCode: uploadResponse.status, body: JSON.stringify({ error: `A kép feltöltése sikertelen: ${errorText}` }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`, path })
    };
  } catch (error) {
    console.error('[UploadNewsletterImage]', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Ismeretlen szerverhiba.' }) };
  }
}
