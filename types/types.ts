
export interface QueryTranslation {
  id: string;
  timestamp: Date;
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedResponse: string;
  status: 'pending' | 'completed' | 'error';
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedResponse: string;
}
