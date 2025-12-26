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
    // If GEMINI_API_KEY is set, use Google GenAI as before.
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI, Type } = require("@google/genai");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Translate the following customer support query into English and provide a professional suggested response. \n\nQuery: "${query}"`,
          config: {
            systemInstruction:
              "You are a professional multilingual support agent. Your task is to detect the input language, translate it accurately to English, analyze the sentiment, and draft a helpful, concise English response. Return ONLY valid JSON.",
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
                  description: "A professional response in English.",
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
        console.error("GenAI path failed, falling back to libretranslate:", err);
      }
    }

    // Fallback path: use LibreTranslate public instance (no API key required).
    // This provides translation and language detection without any secret.
    const libreBase = "https://libretranslate.de";

    // Detect language
    const detectRes = await fetch(`${libreBase}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: query }),
    });
    let detectedLanguage = "unknown";
    try {
      const detects = await detectRes.json();
      if (Array.isArray(detects) && detects[0] && detects[0].language) {
        detectedLanguage = detects[0].language;
      }
    } catch (err) {
      console.warn("Language detection failed:", err);
    }

    // Map common ISO codes to friendly names
    const languageMap = {
      en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi'
    };
    const detectedLanguageName = languageMap[detectedLanguage] || detectedLanguage || 'Unknown';

    // Translate to English
    const translateRes = await fetch(`${libreBase}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, source: detectedLanguage || "auto", target: "en", format: "text" }),
    });

    const translateJson = await translateRes.json();
    const translatedText = translateJson.translatedText || query;

    // Simple rule-based sentiment analysis (best-effort)
    const pos = ["thank", "great", "awesome", "good", "happy", "love", "excellent", "thanks"];
    const neg = ["problem", "not", "no", "can't", "cannot", "bad", "error", "issue", "angry", "frustrat"];
    const lc = translatedText.toLowerCase();
    let score = 0;
    pos.forEach((w) => { if (lc.includes(w)) score += 1; });
    neg.forEach((w) => { if (lc.includes(w)) score -= 1; });
    const sentiment = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";

    // Simple suggested response template
    let suggestedResponse = `Thank you for reaching out. Regarding: "${translatedText}" — we'll review your message and follow up shortly.`;
    if (sentiment === "negative") {
      suggestedResponse = `We're sorry you're experiencing an issue. Regarding: "${translatedText}" — could you please provide additional details so we can help resolve this?`;
    }

    return res.status(200).json({
      translatedText,
      detectedLanguage: detectedLanguageName,
      sentiment,
      suggestedResponse,
    });
  } catch (error) {
    console.error("Translation failed:", error);
    return res
      .status(500)
      .json({ error: "Failed to process the query. Please try again." });
  }
};
