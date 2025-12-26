import { TranslationResponse } from "../types";

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi'
};

export const translateViaLibre = async (query: string): Promise<TranslationResponse> => {
  try {
    const libreBase = 'https://libretranslate.de';

    const detectRes = await fetch(`${libreBase}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query })
    });

    let detectedCode = 'auto';
    try {
      const detects = await detectRes.json();
      if (Array.isArray(detects) && detects[0] && detects[0].language) {
        detectedCode = detects[0].language;
      }
    } catch (err) {
      console.warn('Client language detection failed:', err);
    }

    const translateRes = await fetch(`${libreBase}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, source: detectedCode || 'auto', target: 'en', format: 'text' }),
    });

    const translateJson = await translateRes.json();
    const translatedText = translateJson.translatedText || query;

    const lc = translatedText.toLowerCase();
    const pos = ["thank", "great", "awesome", "good", "happy", "love", "excellent", "thanks"];
    const neg = ["problem", "not", "no", "can't", "cannot", "bad", "error", "issue", "angry", "frustrat"];
    let score = 0;
    pos.forEach((w) => { if (lc.includes(w)) score += 1; });
    neg.forEach((w) => { if (lc.includes(w)) score -= 1; });
    const sentiment = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';

    const detectedLanguage = LANGUAGE_MAP[detectedCode] || detectedCode || 'Unknown';

    let suggestedResponse = `Thank you for reaching out. Regarding: "${translatedText}" — we'll review your message and follow up shortly.`;
    if (sentiment === 'negative') {
      suggestedResponse = `We're sorry you're experiencing an issue. Regarding: "${translatedText}" — could you please provide additional details so we can help resolve this?`;
    }

    return {
      translatedText,
      detectedLanguage,
      sentiment: sentiment as 'positive' | 'neutral' | 'negative',
      suggestedResponse,
    };
  } catch (err) {
    console.error('translateViaLibre error:', err);
    return {
      translatedText: query,
      detectedLanguage: 'Unknown',
      sentiment: 'neutral',
      suggestedResponse: `Thanks for your message: "${query}"`,
    };
  }
};

export default translateViaLibre;
import { TranslationResponse } from "../types";

const LIBRE_BASE = "https://libretranslate.de";

const languageMap: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi'
};

export const translateAndAnalyzeQuery = async (query: string): Promise<TranslationResponse> => {
  try {
    // Detect language
    const detectRes = await fetch(`${LIBRE_BASE}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query })
    });

    let detectedCode = 'auto';
    try {
      const detects = await detectRes.json();
      if (Array.isArray(detects) && detects[0] && detects[0].language) {
        detectedCode = detects[0].language;
      }
    } catch (err) {
      console.warn('Client detection failed, defaulting to auto', err);
    }

    // Translate to English
    const translateRes = await fetch(`${LIBRE_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, source: detectedCode || 'auto', target: 'en', format: 'text' })
    });

    const translateJson = await translateRes.json();
    const translatedText = translateJson.translatedText || query;

    // Basic sentiment
    const pos = ["thank", "great", "awesome", "good", "happy", "love", "excellent", "thanks"];
    const neg = ["problem", "not", "no", "can't", "cannot", "bad", "error", "issue", "angry", "frustrat"];
    const lc = translatedText.toLowerCase();
    let score = 0;
    pos.forEach((w) => { if (lc.includes(w)) score += 1; });
    neg.forEach((w) => { if (lc.includes(w)) score -= 1; });
    const sentiment = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';

    const detectedLanguage = languageMap[detectedCode] || detectedCode || 'Unknown';

    let suggestedResponse = `Thank you for reaching out. Regarding: "${translatedText}" — we'll review your message and follow up shortly.`;
    if (sentiment === 'negative') {
      suggestedResponse = `We're sorry you're experiencing an issue. Regarding: "${translatedText}" — could you please provide additional details so we can help resolve this?`;
    }

    return {
      translatedText,
      detectedLanguage,
      sentiment: sentiment as TranslationResponse['sentiment'],
      suggestedResponse,
    } as TranslationResponse;
  } catch (err) {
    console.error('Client translation failed:', err);
    throw new Error('Client-side translation failed');
  }
};

export default translateAndAnalyzeQuery;
