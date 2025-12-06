
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateLegalDoc = async (docType: string, clientName: string, county: string, extraDetails: string) => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a professional legal document drafter for a North Carolina Bail Bond Agency.
      Your task is to draft a formal ${docType}.
      
      Details:
      - Client Name: ${clientName}
      - County: ${county}
      - Additional Context: ${extraDetails}
      
      Tone & Style:
      - Professional, authoritative, and legally precise for NC jurisdiction.
      - Ensure clear structure and formatting (suitable for a text editor).
      - Do not include markdown formatting (like bolding), just plain text.
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

export interface AgentResponse {
  text: string;
  chunks: any[];
}

export const askAgentAssistant = async (query: string): Promise<AgentResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    // Using Google Search grounding for the "AI Agent" persona (Deep researcher)
    const response = await ai.models.generateContent({
      model: model,
      contents: `You are a strategic AI Agent for a Bail Bond agency. Provide a detailed, researched answer to this query: ${query}. Focus on NC statutes, local court procedures, or competitive market analysis if asked.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    return {
        text: response.text || "No response generated.",
        chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I am currently unavailable. Please check your network or API key.", chunks: [] };
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

export const generateSocialPost = async (platform: string, topic: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    let constraints = '';
    
    switch(platform) {
        case 'X':
            constraints = 'Under 280 characters, use 2-3 relevant hashtags, concise and punchy.';
            break;
        case 'TikTok':
            constraints = 'Draft a short video script caption, engaging, trending, use emojis and viral hashtags.';
            break;
        case 'Facebook':
            constraints = 'Professional yet engaging tone, suitable for local community business page, include call to action.';
            break;
    }

    const prompt = `Draft a social media post for a Bail Bond Agency on ${platform}.
    Topic: ${topic}
    Constraints: ${constraints}
    
    Output ONLY the post content.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Social Gen Error:", error);
    return `Error drafting content for ${topic}.`;
  }
};
