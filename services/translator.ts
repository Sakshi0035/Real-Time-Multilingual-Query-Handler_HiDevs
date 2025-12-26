import { TranslationResponse } from "../types";

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi'
};

export const translateViaLibre = async (query: string): Promise<TranslationResponse> => {
  try {
    // Call the backend endpoint which handles Gemini (if key is available)
    // and falls back to MyMemory if needed. This keeps API keys server-side.
    // Use a blank default so production calls the same host (`/api/translate`).
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        translatedText: data.translatedText || query,
        detectedLanguage: data.detectedLanguage || 'Unknown',
        sentiment: (data.sentiment as 'positive' | 'neutral' | 'negative') || 'neutral',
        suggestedResponse: data.suggestedResponse || '',
      };
    }
    console.warn('Backend response not OK:', response.status);
  } catch (err) {
    console.warn('Backend call failed, using MyMemory fallback:', err);
  }

  // Client-side LibreTranslate fallback if backend is unavailable.
  // LibreTranslate provides a detect endpoint and a translate endpoint
  // which tend to return reliable English translations for common phrases.
  try {
    // Detect language first
    const detectResp = await fetch('https://libretranslate.de/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query }),
    });
    const detectJson = await detectResp.json();
    const detectedCode = Array.isArray(detectJson) && detectJson[0] && detectJson[0].language ? detectJson[0].language : null;

    // Translate to English explicitly
    const trResp = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, source: detectedCode || 'auto', target: 'en', format: 'text' }),
    });
    const trJson = await trResp.json();
    const translatedText = trJson && (trJson.translatedText || trJson.translated) ? (trJson.translatedText || trJson.translated) : query;

    return {
      translatedText,
      detectedLanguage: detectedCode && LANGUAGE_MAP[detectedCode] ? LANGUAGE_MAP[detectedCode] : (detectedCode || 'Unknown'),
      sentiment: 'neutral',
      suggestedResponse: '',
    };
  } catch (err) {
    console.error('translateViaLibre error:', err);
    return {
      translatedText: query,
      detectedLanguage: 'Unknown',
      sentiment: 'neutral',
      suggestedResponse: '',
    };
  }
};

export default translateViaLibre;

