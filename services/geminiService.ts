import { GoogleGenAI, Type } from "@google/genai";

// Initialize GenAI client
// Note: For Veo, we need to re-instantiate with the selected key if provided, 
// but for general use we use process.env.API_KEY
const getAiClient = (apiKey?: string) => new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });

export const generateImageEdit = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg', 
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

export const generateVeoVideo = async (base64Image: string, prompt: string = "Cinematic pan of the property"): Promise<string> => {
  // Veo requires a paid key selection
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
        // If not, try to open selector
        if(window.aistudio.openSelectKey) {
             await window.aistudio.openSelectKey();
             // Check again or assume success - simplified for this flow
        } else {
            throw new Error("AI Studio Key Selector not available.");
        }
    }
  }

  // Re-init with potential new key state (handled internally by the env or the selector context usually, 
  // but here we rely on process.env.API_KEY being updated or just standard flow if the environment supports it)
  // Ideally, we would get the key returned, but per instructions we just call openSelectKey and proceed.
  // We will create a new client just in case.
  const ai = getAiClient();

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: base64Image,
        mimeType: 'image/jpeg',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI returned");
    
    // Fetch the actual video bytes
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};

export const performMarketResearch = async (query: string): Promise<{text: string, sources: any[]}> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No results found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources };
  } catch (error) {
    console.error("Market research error:", error);
    return { text: "Failed to perform market research. Please try again.", sources: [] };
  }
};

// Live API Helpers
export const connectLiveSession = async (
  onAudioData: (base64: string) => void,
  onClose: () => void
) => {
  const ai = getAiClient();
  const session = await ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => console.log("Live session opened"),
      onmessage: (message) => {
         const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
         if (base64Audio) {
            onAudioData(base64Audio);
         }
         if (message.serverContent?.interrupted) {
             // Handle interruption if needed
         }
      },
      onclose: () => {
        console.log("Live session closed");
        onClose();
      },
      onerror: (e) => console.error("Live session error", e),
    },
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }
      },
      systemInstruction: "You are a helpful real estate investment assistant. Help the user analyze the cash flow and potential of the property they are viewing. Be concise and professional.",
    }
  });
  return session;
};

// Helper to encode PCM for Live API
export function pcmToBlob(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    return {
      data: base64,
      mimeType: 'audio/pcm;rate=16000',
    };
  }
