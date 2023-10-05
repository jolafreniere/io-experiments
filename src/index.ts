const { app, globalShortcut, BrowserWindow } = require("electron");

import * as dotenv from "dotenv";
import { playSound } from "./audio/Player";
import { realTimeTranscription, recordAudio } from "./audio/Recorder";
import { transcribe } from "./audio/Transcriber";
import { captureImage } from "./image/Webcam";
dotenv.config();

const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws: any) => {
  console.log("Client connected");
  setInterval(() => {
    ws.send("Hello, world");
  }, 1000);

  ws.on("message", (message: any) => {
    console.log(`Received: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

app
  .whenReady()
  .then(() => {
    globalShortcut.register("F9", async () => {
      console.log("F9 key pressed");
      playSound("./resources/boop.mp3");
      await recordAudio(10, "./data/out.wav");
      const transcription = await transcribe(
        "./data/out.wav",
        "Listen carefully to the following audio and transcribe it"
      );
      console.log(transcription);
    });
    globalShortcut.register("F10", async () => {
      console.log("F10 key pressed");
      playSound("./resources/boop.mp3");
      realTimeTranscription(5);
    });
    globalShortcut.register("F11", async () => {
      console.log("F11 key pressed");
      playSound("./resources/boop.mp3");
      captureImage("./data/out.png");
    });
    globalShortcut.register("Shift+F2", async () => {
      playSound("./resources/boop.mp3");
    });
    globalShortcut.register("Ctrl+F2", async () => {
      wss.clients.forEach((client: any) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send("Hello");
        }
      });
      playSound("./resources/boop.mp3");
    });
  })
  .then(createWindow);

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

function createWindow() {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("../resources/index.html");
  win.webContents.on("did-finish-load", () => {
    win.webContents.executeJavaScript(`
      const WebSocket = require('ws');
      const ws = new WebSocket('ws://localhost:8080');

      ws.on('open', function open() {
        ws.send('Value X');
      });

        ws.on('message', function incoming(data) {
        document.getElementById('message').textContent = data;
        console.log('received: %s', data);
        });
    `);
  });
}
