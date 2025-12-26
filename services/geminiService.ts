import translator from './translator';

// Frontend entrypoint for translation. Uses server proxy when `VITE_API_URL` is set
// (and expected to host /api/translate), otherwise falls back to client LibreTranslate.
export const translateAndAnalyzeQuery = async (query: string) => {
  // If a backend URL is configured, prefer it (keeps keys server-side when available)
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    try {
      const resp = await fetch(`${apiUrl.replace(/\/$/, '')}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (resp.ok) {
        return await resp.json();
      }
      console.warn('Backend translate failed, falling back to client translator', resp.status);
    } catch (err) {
      console.warn('Backend translate error, falling back to client translator', err);
    }
  }

  // Client-side fallback (no API key required)
  return translator(query);
};

export default translateAndAnalyzeQuery;
