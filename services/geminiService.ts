import { GoogleGenerativeAI } from "@google/generative-ai";

// Safe access to API Key for browser environments
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.API_KEY || process.env.GEMINI_API_KEY;
  }
  return 'mock-key-for-ui-render'; 
};

const genAI = new GoogleGenerativeAI(getApiKey());

// --- DOCUMENT DRAFTER ---
export const generateLegalDoc = async (docType: string, clientName: string, county: string, extraDetails: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
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
    // Note: tools support syntax differs in @google/generative-ai
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash" 
        // Tools would be configured here if supported by the specific model/library version in this environment
    });
    
    const result = await model.generateContent(`You are a strategic AI Agent for a Bail Bond agency. Provide a detailed, researched answer to this query: ${query}. Focus on NC statutes, local court procedures, or competitive market analysis if asked.`);
    const response = await result.response;
    
    // Check for grounding metadata if available in response
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return {
        text: response.text() || "No response generated.",
        chunks: (groundingMetadata as any)?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I am currently unavailable. Please check your network or API key.", chunks: [] };
  }
};

// --- COMPLIANCE CHAT ---
export const complianceChat = async (userPrompt: string): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: 'You are an expert Bail Bond Compliance Officer for North Carolina (NC BondFlow). Your answers must be legally precise, citing NCGS Chapter 58 where relevant. Keep responses professional, concise, and actionable.'
        });
        
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
                temperature: 0.7,
            }
        });
        
        const response = await result.response;
        return response.text() || "No response.";
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const query = `Find the official address and phone number for the following authorities in ${countyName}, North Carolina:
    1. Clerk of Superior Court
    2. Sheriff's Office / County Jail
    3. District Attorney
    
    Please provide the specific physical address for each.`;

    const result = await model.generateContent(query);
    const response = await result.response;

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return {
      text: response.text() || "No results found via Google Maps.",
      chunks: (groundingMetadata as any)?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    return null;
  }
};

// --- TRANSLATION ---
export const translateText = async (text: string, targetLang: 'es' | 'en' | string): Promise<string> => {
  try {
    const target = targetLang === 'es' ? 'Spanish' : (targetLang === 'en' ? 'English' : targetLang);
    
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: `You are a specialized Legal Interpreter for the Bail Bond industry. Translate the user input to ${target}. Use precise legal terminology suitable for North Carolina jurisdiction (e.g., "Forfeiture" -> "Confiscación", "Bond" -> "Fianza"). Output ONLY the translated text.`
    });

    const result = await model.generateContent(text);
    const response = await result.response;

    return response.text() || "";
  } catch (error) {
    console.error("Translation Error:", error);
    return "[Translation Failed]";
  }
};

// --- SOCIAL MEDIA CONTENT GENERATION ---
export const generateMarketingContent = async (task: string, context: string): Promise<string> => {
  try {
    const systemPrompt = `You are a Social Media Manager for a professional Bail Bond Agency.
    Your goal is to generate high-engagement content that builds trust, explains services, and targets local clients in North Carolina.
    
    TASKS:
    - If task is 'caption': Write a punchy, engaging caption (under 280 chars for Twitter, longer for Facebook).
    - If task is 'hashtags': Generate 5-10 relevant, trending hashtags for NC bail bonds.
    - If task is 'strategy': Suggest the best time to post and a content angle for the given topic.
    
    Return ONLY the requested content.`;

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: systemPrompt
    });

    const result = await model.generateContent(`Task: ${task}\nTopic/Context: ${context}`);
    const response = await result.response;

    return response.text() || "";
  } catch (error) {
    console.error("Gemini Marketing Error:", error);
    return "Error generating content. Please check API Key.";
  }
};

// --- SOCIAL MEDIA HELPER ---
export const generateSocialPost = async (platform: string, topic: string): Promise<string> => {
   return generateMarketingContent('caption', `Platform: ${platform}. Topic: ${topic}`);
};