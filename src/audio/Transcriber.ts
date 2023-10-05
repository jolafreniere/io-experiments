import fs from "fs";
import OpenAI from "openai";
let openai: OpenAI;


export async function transcribe(path: string, prompt: string) {
    openai = new OpenAI({
        apiKey: process.env.API_KEY,
    });
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(path),
        model: "whisper-1",
        language: "en",
        prompt: prompt,
    });
    try {
        fs.unlink(path, () => { });
    } catch (e) { }
    return transcription.text;
}

