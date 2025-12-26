import { TranslationResponse } from "../types";

/**
 * A sophisticated local simulation engine that mimics AI behavior.
 * This allows the app to be fully functional without a Gemini API key.
 */
export const translateAndAnalyzeQuery = async (query: string): Promise<TranslationResponse> => {
  // Simulate network/processing latency
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

  const text = query.toLowerCase();
  
  // Local Pattern Recognition Logic
  let detectedLanguage = "English";
  let translatedText = query;
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  let suggestedResponse = "Thank you for reaching out. A support specialist will review your request shortly.";

  // Spanish Detection
  if (text.includes("hola") || text.includes("problema") || text.includes("ayuda") || text.includes("gracias")) {
    detectedLanguage = "Spanish";
    if (text.includes("cancelar")) {
      translatedText = "I would like to cancel my current subscription.";
      sentiment = "negative";
      suggestedResponse = "I'm sorry to hear you want to cancel. I can help guide you through the cancellation process or offer a discount to keep your service active.";
    } else if (text.includes("hola")) {
      translatedText = "Hello, I need some assistance with my account.";
      sentiment = "positive";
      suggestedResponse = "Hello! I'd be happy to help you with your account. Could you please provide your account ID or email address?";
    } else {
      translatedText = "The customer is asking for general help regarding a service issue.";
      sentiment = "neutral";
      suggestedResponse = "Understood. Please let us know the specific details of the issue so we can assist you better.";
    }
  } 
  // French Detection
  else if (text.includes("bonjour") || text.includes("aide") || text.includes("merci") || text.includes("problème")) {
    detectedLanguage = "French";
    translatedText = "Hello, I am having a problem and I need your help, thank you.";
    sentiment = "neutral";
    suggestedResponse = "Hello! We are here to help. Could you please describe the problem you are experiencing in more detail?";
  }
  // German Detection
  else if (text.includes("hallo") || text.includes("hilfe") || text.includes("danke") || text.includes("preis")) {
    detectedLanguage = "German";
    translatedText = "Hello, I have a question about the pricing of your services.";
    sentiment = "neutral";
    suggestedResponse = "Hello! Our pricing plans vary depending on your needs. You can find the full breakdown on our 'Pricing' page, or I can explain the main options here.";
  }
  // Japanese Detection
  else if (/[\u3040-\u30ff\u4e00-\u9faf]/.test(query)) {
    detectedLanguage = "Japanese";
    translatedText = "The customer is inquiring in Japanese regarding technical support or service status.";
    sentiment = "positive";
    suggestedResponse = "Thank you for your inquiry. We are currently translating your request for our technical team. We appreciate your patience.";
  }
  // Default/Generic English or unknown
  else {
    detectedLanguage = "Detected: English/Auto";
    translatedText = query;
    sentiment = text.length > 50 ? "neutral" : "positive";
    suggestedResponse = "Thank you for your message. How can I best assist you with this today?";
  }

  // Add a bit of "AI randomness" to sentiment if not explicitly set
  if (sentiment === 'neutral' && Math.random() > 0.8) sentiment = 'positive';

  return {
    translatedText,
    detectedLanguage,
    sentiment,
    suggestedResponse
  };
};

export default translateAndAnalyzeQuery;
