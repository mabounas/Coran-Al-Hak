// api.quran-tafseer.com answers over plain HTTP only, which a browser refuses
// to call from our HTTPS page. This function fetches it server side and serves
// the result from our own origin.
const UPSTREAM = 'http://api.quran-tafseer.com/tafseer';

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');

  const { sura, ayah, tafseer = '1' } = request.query;
  const numbers = [sura, ayah, tafseer].map(Number);

  if (numbers.some((value) => !Number.isInteger(value) || value < 1)) {
    response.status(400).json({ error: 'sura, ayah and tafseer must be positive integers' });
    return;
  }

  const [suraNumber, ayahNumber, tafseerId] = numbers;

  try {
    const upstream = await fetch(`${UPSTREAM}/${tafseerId}/${suraNumber}/${ayahNumber}`, {
      headers: { Accept: 'application/json' },
    });

    if (!upstream.ok) {
      response.status(upstream.status).json({ error: `Upstream returned ${upstream.status}` });
      return;
    }

    const data = await upstream.json();
    // The commentary never changes; let the CDN keep it.
    response.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=86400');
    response.status(200).json(data);
  } catch (error) {
    response.status(502).json({ error: 'Could not reach the tafsir service' });
  }
}
