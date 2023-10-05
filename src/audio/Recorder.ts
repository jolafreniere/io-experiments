import { spawn } from "child_process";
import * as fs from "fs";
import { removeFileIfExists, wait } from "../Utils";
import { transcribe } from "./Transcriber";
export async function recordAudio(durationSeconds: number, outputFileName: string = "./data/out.wav"): Promise<void> {
    await removeFileIfExists(outputFileName);
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn(
            `C:\\ffmpeg\\ffmpeg.exe -f dshow -i audio="Microphone (3- USB PnP Audio Device)" -t ${durationSeconds} ${outputFileName}`,
            { shell: true }
        );
        ffmpeg.on("close", (code: any) => {
            if (code !== 0) {
                console.log(`FFmpeg exited with code ${code}`);
                reject(new Error(`FFmpeg exited with code ${code}`));
            }
            resolve();
        });

        ffmpeg.on("error", (error: any) => {
            console.log("An error occurred:", error);
            reject(error);
        });
    });
}

const transcriptions = {
    currentId: 0,
    "values": [] as Record<number, string>[]
};
export async function realTimeTranscription(numberOfThreads: number = 3) {
    for (let i = 0; i < numberOfThreads; i++) {
        recordLoop(i, 2.5, 15, transcriptions as any)
        await wait(500);
    }
}
async function recordLoop(id: number, duration: number, loopDuration: number = 15, transcriptions: { values: Record<number, string>[], currentId: number }) {
    //TODO: god help us 
    while (loopDuration - duration > 0) {
        loopDuration -= duration;
        const outputFilePath = `./data/out${id}.wav`;
        const currentId = transcriptions.currentId++;
        await recordAudio(duration, outputFilePath);
        const transcription = await transcribe(outputFilePath, getPrompt(currentId));
        const obj = {
            id: currentId,
            transcription
        }
        transcriptions[`values`]!.push(obj as any);
        if (currentId % 3 === 0) {
            // merge the last 3 transcriptions into one
            const text = transcriptions.values.slice(-3).reduce((acc, val: any) => {
                return `${acc} ${val.transcription}`
            }, "")
            console.log(text + "!!!!")
            createCompletion(text as string, 1000, "gpt-3.5-turbo-16k").then(text => console.log(text));
        }
        // console.log(obj)
    }
    fs.writeFileSync("./data/transcriptions.json", JSON.stringify(transcriptions, null, 4));

    // console.log(text);
}

function getPrompt(id: number) {
    if (id + 1 <= transcriptions.currentId && id - 1 >= 0) {
        return `Merge the the past, current and following transcription as plain english text (no json): past: ${transcriptions.values[id - 1]}, current: ${transcriptions.values[id]}, next: ${transcriptions.values[id + 1]}`
    } else {
        return "Listen carefully to the following audio and transcribe it into english text (ignore JSON)"
    }
}

import OpenAI from "openai";
//models are gpt-3.5-turbo, gpt-3.5-turbo-16k, gpt-4, gpt-4-32k
import * as dotenv from 'dotenv';
dotenv.config();
const openai = new OpenAI({
    apiKey: process.env.API_KEY,
});

export async function createCompletion(message: string, max_tokens: number = 1000, model: string = "gpt-3.5-turbo") {

    const opt: OpenAI.Chat.ChatCompletionCreateParams = {
        model: "gpt-3.5-turbo",
        max_tokens: max_tokens,

        n: 1,
        temperature: 0.8,
        stream: false,
        messages: [
            {
                role: "system",
                content: "Merge the following transcriptions, discard the messages if they do not fit in context",
            },
            {
                role: "user",
                content: message,
            },
        ]
    };
    const response = await openai.chat.completions.create(opt);
    return response.choices[0].message.content;
}
