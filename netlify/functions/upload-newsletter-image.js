// =============================================================================
// netlify/functions/upload-newsletter-image.js
// Hírlevél képek feltöltése Supabase Storage-ba.
// A service role kulcs KIZÁRÓLAG szerveroldali Netlify környezeti változó lehet.
// =============================================================================

const BUCKET = 'newsletter-images';
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { fileName, contentType, data } = JSON.parse(event.body || '{}');
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

    if (!supabaseUrl || !serviceKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'A képfeltöltéshez hiányzik a SUPABASE_URL vagy a SUPABASE_SERVICE_ROLE_KEY Netlify környezeti változó.'
        })
      };
    }

    if (!ALLOWED_TYPES.has(contentType)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Csak JPG, PNG vagy WebP kép tölthető fel.' }) };
    }

    if (!data || typeof data !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Hiányzik a kép adata.' }) };
    }

    const buffer = Buffer.from(data, 'base64');
    if (buffer.length > MAX_BYTES) {
      return { statusCode: 400, body: JSON.stringify({ error: 'A kép legfeljebb 4 MB lehet.' }) };
    }

    const ext = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1];
    const safeBase = String(fileName || 'flyer')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'flyer';
    const path = `flyers/${Date.now()}-${safeBase}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const headers = {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': contentType,
      'x-upsert': 'false'
    };

    const bucketResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true })
    });

    // 409 = a bucket már létezik, ez rendben van.
    if (!bucketResponse.ok && bucketResponse.status !== 409) {
      const bucketError = await bucketResponse.text();
      console.warn('[UploadNewsletterImage] Bucket ellenőrzés/létrehozás:', bucketError);
    }

    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${BUCKET}/${encodeURIComponent(path)}`,
      { method: 'POST', headers, body: buffer }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return {
        statusCode: uploadResponse.status,
        body: JSON.stringify({ error: `A kép feltöltése sikertelen: ${errorText}` })
      };
    }

    const url = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url, path })
    };
  } catch (error) {
    console.error('[UploadNewsletterImage]', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Ismeretlen szerverhiba.' }) };
  }
}
