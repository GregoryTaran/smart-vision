import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { setCORS } from "./cors.js";
import fs from "fs";
import path from "path";
import os from "os";
import OpenAI from "openai";

// 🔐 Подключаем секрет из Google Secret Manager
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export const speakToWhisper = onRequest(
  { secrets: [OPENAI_API_KEY] },
  async (req, res) => {
    if (setCORS(res, req)) return;

    try {
      if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method not allowed" });
      }

      const { audio, ext = "webm" } = req.body || {};
      if (!audio) {
        return res.status(400).json({ ok: false, error: "No audio provided" });
      }

      // ✅ Кроссплатформенная временная директория
      const tmpFile = path.join(os.tmpdir(), `chunk.${ext}`);
      fs.writeFileSync(tmpFile, Buffer.from(audio, "base64"));

      // 🔑 Инициализируем OpenAI с секретом из Firebase
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY.value(),
      });

      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tmpFile),
        model: "whisper-1",
        response_format: "text",
      });

      // Удаляем временный файл после обработки
      fs.unlink(tmpFile, () => {});

      res.status(200).json({ ok: true, text: response });
    } catch (err) {
      console.error("❌ speakToWhisper error:", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  }
);
