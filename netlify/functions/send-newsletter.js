// =============================================================================
//  netlify/functions/send-newsletter.js
//  Szerveroldali Netlify Function a Resend e-mail küldéshez (CORS áthidalás & biztonság)
// =============================================================================

export async function handler(event, context) {
  // Csak POST kéréseket engedünk
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { fromEmail, recipients, subject, htmlContent } = JSON.parse(event.body || '{}');

    const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Hiányzik a Resend API kulcs a környezeti változókból.' })
      };
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nincsenek megadva címzettek.' })
      };
    }

    const sender = fromEmail || 'Kőszegi Turisztikai Szövetség Egyesület <info@ktsze.hu>';
    const results = { total: recipients.length, success: 0, failed: 0, errors: [] };

    // Szerveroldalon küldjük el a leveleket a Resend REST API-n keresztül (NINCS CORS probléma!)
    for (const recipient of recipients) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: sender,
            to: [recipient.email],
            subject: subject,
            html: htmlContent.replace(/{{NAME}}/g, recipient.name || 'Tisztelt Tagunk')
          })
        });

        if (resendRes.ok) {
          results.success += 1;
        } else {
          const errData = await resendRes.json().catch(() => ({}));
          results.failed += 1;
          results.errors.push(`${recipient.email}: ${errData.message || resendRes.statusText}`);
        }
      } catch (err) {
        results.failed += 1;
        results.errors.push(`${recipient.email}: ${err.message}`);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
