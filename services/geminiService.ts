import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateLegalDoc = async (docType: string, clientName: string, county: string, extraDetails: string) => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a legal assistant for a North Carolina Bail Bond Agency.
      Draft a formal ${docType}.
      
      Details:
      - Client Name: ${clientName}
      - County: ${county}
      - Additional Details: ${extraDetails}
      
      Ensure the tone is professional, legally sound for NC, and formatted as a clear text document. 
      Do not include markdown formatting like bolding, just plain text suitable for a textarea.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating document. Please check API Key configuration.";
  }
};

export const askAgentAssistant = async (query: string) => {
  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: model,
      contents: `You are an expert on North Carolina Bail Bond laws and agency operations. Answer the following agent query briefly and professionally: ${query}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am currently unavailable. Please try again later.";
  }
};

export interface MapSearchResult {
  text: string;
  chunks: any[];
}

export const searchAuthorityWithMaps = async (countyName: string): Promise<MapSearchResult | null> => {
  try {
    const model = 'gemini-2.5-flash';
    const query = `Find the official address and phone number for the following authorities in ${countyName}, North Carolina:
    1. Clerk of Superior Court
    2. Sheriff's Office / County Jail
    3. District Attorney
    
    Please provide the specific physical address for each.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    return {
      text: response.text || "No results found via Google Maps.",
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    return null;
  }
};

export const translateText = async (text: string, targetLang: 'es' | 'en' | string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const target = targetLang === 'es' ? 'Spanish' : 'English';
    const prompt = `Translate the following text to ${target}. Output ONLY the translated text, no preamble or explanation. Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Translation Error:", error);
    return "[Translation Failed]";
  }
};
