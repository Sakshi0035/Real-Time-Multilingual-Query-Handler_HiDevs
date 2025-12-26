import { TranslationResponse } from "../types";

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi'
};

export const translateViaLibre = async (query: string): Promise<TranslationResponse> => {
  try {
    // Call the backend endpoint which handles Gemini (if key is available)
    // and falls back to MyMemory if needed. This keeps API keys server-side.
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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

  // Client-side MyMemory fallback if backend is unavailable
  try {
    const encoded = encodeURIComponent(query);
    const mm = await (await fetch(`https://api.mymemory.translated.net/get?q=${encoded}&langpair=auto|en`)).json();
    const translatedText = (mm && mm.responseData && mm.responseData.translatedText) ? mm.responseData.translatedText : query;
    return {
      translatedText,
      detectedLanguage: 'Unknown',
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

