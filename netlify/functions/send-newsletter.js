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

    // Tisztított feladó név (Resend szigorú RFC822 formátum)
    let sender = fromEmail || 'Koszegi Turisztikai Szovetseg <info@ktsze.hu>';
    if (sender.includes('Kőszegi')) {
      sender = sender.replace('Kőszegi', 'Koszegi').replace('Szövetség', 'Szovetseg').replace('Egyesület', 'Egyesulet');
    }

    const results = { total: recipients.length, success: 0, failed: 0, errors: [] };

    // Szerveroldalon küldjük el a leveleket a Resend REST API-n keresztül
    for (const recipient of recipients) {
      try {
        let resendRes = await fetch('https://api.resend.com/emails', {
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

        // Ha a domain még nem verificált a Resend-ben, tartalék feladóval próbáljuk (onboarding@resend.dev)
        if (!resendRes.ok) {
          const firstErr = await resendRes.json().catch(() => ({}));
          console.warn('[SendNewsletter] Elsődleges feladó sikertelen, próbálkozás tartalékkal:', firstErr);

          const fallbackRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey.trim()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'KTSZE Egyesulet <onboarding@resend.dev>',
              to: [recipient.email],
              subject: subject,
              html: htmlContent.replace(/{{NAME}}/g, recipient.name || 'Tisztelt Tagunk')
            })
          });

          if (fallbackRes.ok) {
            results.success += 1;
            continue;
          } else {
            const fallbackErr = await fallbackRes.json().catch(() => ({}));
            results.failed += 1;
            results.errors.push(`${recipient.email}: ${firstErr.message || fallbackErr.message || resendRes.statusText}`);
            continue;
          }
        }

        results.success += 1;
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
