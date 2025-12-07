// This file is deprecated. AI services have been migrated to @google/genai in geminiService.ts.

export const poeChatAnalysis = async (prompt?: string) => ({ 
  success: false, 
  error: "Service Deprecated",
  data: "",
  isMock: false,
  isMissingKey: false,
  isConnectionError: false
});

export const poeTranslation = async (text?: string, lang?: string) => ({ 
  success: false, 
  error: "Service Deprecated",
  data: "",
  isMock: false,
  isMissingKey: false,
  isConnectionError: false
});

export const setPoeRuntimeConfig = (key?: string, url?: string) => {};

export const getPoeConfig = () => ({ key: '', url: '' });