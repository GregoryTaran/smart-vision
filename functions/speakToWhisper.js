/**
 * functions/speakToWhisper.js
 * Реализация обработчика для транскрибации.
 * Экспортирует функцию `handler(req, res, ctx)` — ctx содержит объекты-secrets.
 *
 * Важно: здесь **не** создаём onRequest — это делает index.js лениво.
 */

import fs from "fs";
import os from "os";
import path from "path";

export async function handler(req, res, ctx = {}) {
  // ctx.OPENAI_API_KEY — defineSecret объект передаётся из index.js, его значение берём через .value()
  try {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    // body может быть в req.body или req.json()
    let body = req.body;
    if (!body) {
      try { body = await req.json(); } catch(_) { body = {}; }
    }

    const { audio, ext = "webm", mime } = body || {};
    if (!audio) return res.status(400).json({ ok: false, error: "No audio provided" });

    // создаём временный файл
    const tmpFile = path.join(os.tmpdir(), `sv_chunk_${Date.now()}.${ext}`);
    fs.writeFileSync(tmpFile, Buffer.from(audio, "base64"));

    // ДИНАМИЧЕСКИ импортируем OpenAI только здесь
    const { default: OpenAI } = await import("openai");

    const apiKey = (ctx.OPENAI_API_KEY && typeof ctx.OPENAI_API_KEY.value === "function")
      ? ctx.OPENAI_API_KEY.value()
      : process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // удаляем временный файл
      try { fs.unlinkSync(tmpFile); } catch (_) {}
      return res.status(500).json({ ok: false, error: "OPENAI_API_KEY not set" });
    }

    const openai = new OpenAI({ apiKey });

    // Используем audio.transcriptions.create (совместимо с новой openai SDK)
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: "whisper-1",
      // остальные опции при необходимости
    });

    // чистим файл
    try { fs.unlinkSync(tmpFile); } catch (_) {}

    // response может быть объектом — берем текст
    const text = response?.text ?? (typeof response === "string" ? response : JSON.stringify(response));

    return res.status(200).json({ ok: true, text });
  } catch (err) {
    console.error("speakToWhisper handler error:", err);
    return res.status(500).json({ ok: false, error: err.message ?? String(err) });
  }
}

export default handler;
