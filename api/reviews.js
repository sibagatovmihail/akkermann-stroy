// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reviews  →  Google reviews for this business, fetched server-side
//                      and cached on Vercel's CDN for 24 hours.
// ─────────────────────────────────────────────────────────────────────────────
// Why this exists: the browser used to load the Google Maps JS SDK and call the
// Places API on EVERY page view. That billed one Places request per visitor,
// shipped ~200 KB of SDK to each of them, and exposed the API key in the page
// source. This endpoint calls Google at most once per day no matter how much
// traffic the site gets:
//
//   s-maxage=86400            Vercel's edge serves its cached copy for 24 h and
//                             does not re-invoke this function during that time.
//   stale-while-revalidate    If Google is unreachable, billing lapses, or quota
//     =604800                 is hit, the last good payload keeps serving for up
//                             to a week while a refresh is attempted in the
//                             background. The section never breaks on a blip.
//
// Failures are returned with `Cache-Control: no-store` so a transient error is
// never pinned to the CDN for a day.
//
// Uses the Places API (New). The legacy PlacesService the browser used is closed
// to new customers as of 1 March 2025.
//
// Environment variables (Vercel → Settings → Environment Variables):
//   GOOGLE_PLACES_API_KEY   server-side key, restricted to the Places API
//   GOOGLE_PLACE_ID         the business's Place ID
//   GOOGLE_REVIEWS_LANG     optional BCP-47 language, defaults below
// ─────────────────────────────────────────────────────────────────────────────

const ENDPOINT = 'https://places.googleapis.com/v1/places/';
const FIELDS = 'rating,userRatingCount,googleMapsUri,reviews';

module.exports = async function handler(req, res) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  const lang = process.env.GOOGLE_REVIEWS_LANG || 'de';

  // Not wired up yet — tell the client so it can keep its own fallback content.
  if (!apiKey || !placeId) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      ok: false,
      configured: false,
      reason: 'GOOGLE_PLACES_API_KEY and/or GOOGLE_PLACE_ID are not set',
    });
  }

  try {
    const url = `${ENDPOINT}${encodeURIComponent(placeId)}?languageCode=${encodeURIComponent(lang)}`;
    const upstream = await fetch(url, {
      headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELDS },
    });

    const body = await upstream.json();

    if (!upstream.ok) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).json({
        ok: false,
        configured: true,
        status: upstream.status,
        reason: (body && body.error && body.error.message) || 'Places API request failed',
      });
    }

    const reviews = (body.reviews || []).map((r) => {
      const who = r.authorAttribution || {};
      return {
        author: who.displayName || '',
        authorUrl: who.uri || '',
        photo: who.photoUri || '',
        rating: r.rating || 0,
        text: (r.originalText && r.originalText.text) || (r.text && r.text.text) || '',
        relativeTime: r.relativePublishTimeDescription || '',
        publishedAt: r.publishTime || '',
      };
    }).filter((r) => r.text && r.author);

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({
      ok: true,
      configured: true,
      rating: typeof body.rating === 'number' ? body.rating : null,
      total: typeof body.userRatingCount === 'number' ? body.userRatingCount : null,
      mapsUrl: body.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      writeReviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
      reviews,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({
      ok: false,
      configured: true,
      reason: err && err.message ? err.message : 'network error',
    });
  }
};
