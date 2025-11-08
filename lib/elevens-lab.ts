import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const generateSpeech = async (text: string) => {
    const apiKey = process.env.ELEVEN_LABS_KEY;
    if (!apiKey) {
        throw new Error("ElevenLabs API key is not set in environment variables");
    }
    const client = new ElevenLabsClient({
        apiKey,
    });
    
    const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
        outputFormat: "mp3_44100_128",
        text,
        modelId: "eleven_flash_v2_5",
    });
    return audio;
};

