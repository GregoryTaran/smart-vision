import fs from "fs";
import os from "os";
import path from "path";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { setCORS } from "./cors.js";

// Подключаем секрет (OpenAI API Key)
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

// === Основная логика ===
async function handler(req, res) {
  try {
    if (setCORS(res, req)) return;
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    let body = req.body;
    if (!body) {
      try { body = await req.json(); } catch { body = {}; }
    }

    const { audio, ext = "webm", mime } = body || {};
    if (!audio) return res.status(400).json({ ok: false, error: "No audio provided" });

    // Создаём временный файл
    const tmpFile = path.join(os.tmpdir(), `sv_chunk_${Date.now()}.${ext}`);
    fs.writeFileSync(tmpFile, Buffer.from(audio, "base64"));

    // Импортируем OpenAI динамически
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: "whisper-1",
    });

    fs.unlinkSync(tmpFile);
    const text = response?.text ?? "No text recognized";
    return res.status(200).json({ ok: true, text });
  } catch (err) {
    console.error("❌ speakToWhisper error:", err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}

// === Обёртка для Firebase ===
export const speakToWhisper = onRequest({ secrets: [OPENAI_API_KEY] }, handler);
