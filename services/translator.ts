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

  // Client-side MyMemory fallback if backend is unavailable. Sanitize noisy
  // diagnostic responses (like messages mentioning 'langpair' or ALL-CAPS).
  try {
    const encoded = encodeURIComponent(query);
    const mm = await (await fetch(`https://api.mymemory.translated.net/get?q=${encoded}`)).json();

    let translatedText = query;
    if (mm && mm.responseData && mm.responseData.translatedText) {
      translatedText = mm.responseData.translatedText;
    }

    const looksLikeError = (typeof translatedText === 'string') && (
      translatedText.toLowerCase().includes('langpair') ||
      translatedText.toLowerCase().includes('invalid source') ||
      (translatedText.length > 40 && translatedText === translatedText.toUpperCase())
    );

    if (looksLikeError) {
      if (mm && Array.isArray(mm.matches) && mm.matches.length > 0 && mm.matches[0].translation) {
        translatedText = mm.matches[0].translation;
      } else {
        translatedText = query;
      }
    }

    return {
      translatedText,
      detectedLanguage: (mm && mm.responseData && mm.responseData.lang) ? mm.responseData.lang : 'Unknown',
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

