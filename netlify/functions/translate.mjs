import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following customer support query into English and provide a professional suggested response. 
      
Query: "${query}"`,
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

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Translation failed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process the query. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
