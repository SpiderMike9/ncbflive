import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- DOCUMENT DRAFTER ---
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

// --- RESEARCH AGENT ---
export const askAgentAssistant = async (query: string): Promise<AgentResponse> => {
  try {
    const model = 'gemini-3-pro-preview'; // Using Pro for deeper reasoning
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

// --- COMPLIANCE CHAT (Replaces PoeChat) ---
export const complianceChat = async (userPrompt: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                systemInstruction: 'You are an expert Bail Bond Compliance Officer for North Carolina (NC BondFlow). Your answers must be legally precise, citing NCGS Chapter 58 where relevant. Keep responses professional, concise, and actionable.',
                temperature: 0.7,
            }
        });
        return response.text || "No response.";
    } catch (error: any) {
        console.error("Gemini Chat Error:", error);
        return `Error: ${error.message || 'Service Unavailable'}`;
    }
};

export interface MapSearchResult {
  text: string;
  chunks: any[];
}

// --- MAPS AUTHORITY SEARCH ---
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

// --- TRANSLATION (Replaces PoeTranslate) ---
export const translateText = async (text: string, targetLang: 'es' | 'en' | string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const target = targetLang === 'es' ? 'Spanish' : (targetLang === 'en' ? 'English' : targetLang);
    
    const response = await ai.models.generateContent({
      model: model,
      contents: text,
      config: {
        systemInstruction: `You are a specialized Legal Interpreter for the Bail Bond industry. Translate the user input to ${target}. Use precise legal terminology suitable for North Carolina jurisdiction (e.g., "Forfeiture" -> "Confiscación", "Bond" -> "Fianza"). Output ONLY the translated text.`
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Translation Error:", error);
    return "[Translation Failed]";
  }
};

// --- SOCIAL MEDIA CONTENT GENERATION ---
export const generateMarketingContent = async (task: string, context: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemPrompt = `You are a Social Media Manager for a professional Bail Bond Agency.
    Your goal is to generate high-engagement content that builds trust, explains services, and targets local clients in North Carolina.
    
    TASKS:
    - If task is 'caption': Write a punchy, engaging caption (under 280 chars for Twitter, longer for Facebook).
    - If task is 'hashtags': Generate 5-10 relevant, trending hashtags for NC bail bonds.
    - If task is 'strategy': Suggest the best time to post and a content angle for the given topic.
    
    Return ONLY the requested content.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: `Task: ${task}\nTopic/Context: ${context}`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Marketing Error:", error);
    return "Error generating content. Please check API Key.";
  }
};

// --- SOCIAL MEDIA (Legacy wrapper kept for compatibility) ---
export const generateSocialPost = async (platform: string, topic: string): Promise<string> => {
   return generateMarketingContent('caption', `Platform: ${platform}. Topic: ${topic}`);
};
