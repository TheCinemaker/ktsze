// =============================================================================
//  netlify/functions/send-newsletter.js
//  Szerveroldali Netlify Function a Resend batch e-mail küldéshez
// =============================================================================

const BATCH_SIZE = 100;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function handler(event, context) {
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

    if (!subject || !htmlContent) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Hiányzik a tárgy vagy a levéltartalom.' })
      };
    }

    // Tisztított feladó név (Resend szigorú RFC822 formátum)
    let sender = fromEmail || 'Koszegi Turisztikai Szovetseg <info@ktsze.hu>';
    if (sender.includes('Kőszegi')) {
      sender = sender
        .replace('Kőszegi', 'Koszegi')
        .replace('Szövetség', 'Szovetseg')
        .replace('Egyesület', 'Egyesulet');
    }

    const results = {
      total: recipients.length,
      success: 0,
      failed: 0,
      errors: []
    };

    // A Resend Batch API legfeljebb 100 külön emailt fogad egy kérésben.
    // Ez megszünteti az eddigi címzettenkénti API-hívásokat és a 10 req/sec
    // rate limit tipikus túllépését.
    for (let start = 0; start < recipients.length; start += BATCH_SIZE) {
      const batchRecipients = recipients.slice(start, start + BATCH_SIZE);

      const emails = batchRecipients.map((recipient) => ({
        from: sender,
        to: [recipient.email],
        subject,
        html: htmlContent.replace(/{{NAME}}/g, recipient.name || 'Tisztelt Tagunk')
      }));

      // Idempotency-Key védi a batch-et a véletlen dupla kiküldéstől.
      const batchNumber = Math.floor(start / BATCH_SIZE) + 1;
      const idempotencyKey = `ktsze-newsletter-${Date.now()}-${batchNumber}`;

      try {
        let resendRes = await fetch('https://api.resend.com/emails/batch', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
          },
          body: JSON.stringify(emails)
        });

        // Ha a domain még nincs verifikálva, az egész batch-et egyszer
        // megpróbáljuk a Resend teszt feladójával. Nem küldünk címzettenként
        // külön fallback requestet.
        if (!resendRes.ok) {
          const firstErr = await resendRes.json().catch(() => ({}));
          console.warn(
            '[SendNewsletter] Elsődleges batch küldés sikertelen, fallback próbálkozás:',
            firstErr
          );

          const fallbackEmails = batchRecipients.map((recipient) => ({
            from: 'KTSZE Egyesulet <onboarding@resend.dev>',
            to: [recipient.email],
            subject,
            html: htmlContent.replace(/{{NAME}}/g, recipient.name || 'Tisztelt Tagunk')
          }));

          // A fallback külön kulcsot kap, mert a request payloadja eltér.
          const fallbackIdempotencyKey = `${idempotencyKey}-fallback`;

          resendRes = await fetch('https://api.resend.com/emails/batch', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey.trim()}`,
              'Content-Type': 'application/json',
              'Idempotency-Key': fallbackIdempotencyKey
            },
            body: JSON.stringify(fallbackEmails)
          });

          if (!resendRes.ok) {
            const fallbackErr = await resendRes.json().catch(() => ({}));
            results.failed += batchRecipients.length;
            results.errors.push(
              `Batch ${batchNumber} (${batchRecipients.length} címzett): ${firstErr.message || fallbackErr.message || resendRes.statusText}`
            );
            continue;
          }
        }

        results.success += batchRecipients.length;
      } catch (err) {
        results.failed += batchRecipients.length;
        results.errors.push(
          `Batch ${batchNumber} (${batchRecipients.length} címzett): ${err.message}`
        );
      }

      // Több mint 100 címzettnél legyen egy kis szünet a batch-ek között.
      // Ez tovább csökkenti a rate-limit ütközés esélyét.
      if (start + BATCH_SIZE < recipients.length) {
        await sleep(250);
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
