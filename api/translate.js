export default async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Safe debug: log whether a Gemini key is present (do NOT log the key itself)
    console.log('api/translate: GEMINI_API_KEY present?', !!process.env.GEMINI_API_KEY);

    // If GEMINI_API_KEY is set (from Vercel env or GitHub secrets), use it.
    // The key is stored securely server-side and never exposed to the browser.
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI, Type } = require("@google/genai");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `Translate this customer query into English and return a JSON object with: translatedText, detectedLanguage (friendly name), sentiment (positive/neutral/negative), and suggestedResponse (empty string). Query: "${query}"`,
          config: {
            systemInstruction:
              "You are a professional multilingual translator. Detect the input language, translate to English, analyze sentiment, and return ONLY valid JSON with keys: translatedText, detectedLanguage, sentiment, suggestedResponse.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                translatedText: {
                  type: Type.STRING,
                  description: "The English translation of the customer query.",
                },
                detectedLanguage: {
                  type: Type.STRING,
                  description:
                    "The name of the detected source language (e.g., Spanish, Japanese).",
                },
                sentiment: {
                  type: Type.STRING,
                  description: "One of: positive, neutral, negative.",
                },
                suggestedResponse: {
                  type: Type.STRING,
                  description: "Empty string (no AI recommendations).",
                },
              },
              required: [
                "translatedText",
                "detectedLanguage",
                "sentiment",
                "suggestedResponse",
              ],
            },
          },
        });

        const text = response.text || "{}";
        const result = JSON.parse(text);
        return res.status(200).json(result);
      } catch (err) {
        console.error("Gemini path failed, falling back to MyMemory:", err);
      }
    }

    // Fallback: Use LibreTranslate public instance for detection and translation.
    try {
      const detectResp = await fetch('https://libretranslate.de/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query }),
      });
      const detectJson = await detectResp.json();
      const detectedCode = Array.isArray(detectJson) && detectJson[0] && detectJson[0].language ? detectJson[0].language : null;

      const trResp = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, source: detectedCode || 'auto', target: 'en', format: 'text' }),
      });
      const trJson = await trResp.json();
      const translatedText = trJson && (trJson.translatedText || trJson.translated) ? (trJson.translatedText || trJson.translated) : query;

      const LANGUAGE_MAP = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi' };
      const detectedLanguage = detectedCode && LANGUAGE_MAP[detectedCode] ? LANGUAGE_MAP[detectedCode] : (detectedCode || 'Unknown');

      return res.status(200).json({
        translatedText,
        detectedLanguage,
        sentiment: 'neutral',
        suggestedResponse: '',
      });
    } catch (err) {
      console.error('LibreTranslate fallback failed:', err);
      return res.status(200).json({
        translatedText: query,
        detectedLanguage: 'Unknown',
        sentiment: 'neutral',
        suggestedResponse: '',
      });
    }
  } catch (error) {
    console.error("Translation failed:", error);
    return res
      .status(500)
      .json({ error: "Failed to process the query. Please try again." });
  }
};
