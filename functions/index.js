/**
 * Smart Vision Cloud Functions
 * — Включает: speakToWhisper, saveUser, listUsers, checkUser, getFirebaseConfig
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { setCORS } from "./cors.js";
import { firebaseConfig } from "./config.js";
import OpenAI from "openai";
import fetch from "node-fetch";

// 🔑 Secrets
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const FIREBASE_CONFIG_JSON = defineSecret("FIREBASE_CONFIG_JSON");
const GOOGLE_API_KEY = defineSecret("GOOGLE_API_KEY");
const GOOGLE_KEY_JSON = defineSecret("GOOGLE_KEY_JSON");

// 🧠 Whisper: Speech-to-Text
export const speakToWhisper = onRequest(
  { secrets: [OPENAI_API_KEY] },
  async (req, res) => {
    if (setCORS(res, req)) return;

    try {
      if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method not allowed" });
      }

      const file = req.files?.audio || req.file || null;
      if (!file) return res.status(400).json({ ok: false, error: "No audio file" });

      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });
      const response = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: file,
      });

      res.json({ ok: true, text: response.text });
    } catch (err) {
      console.error("❌ Whisper error:", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  }
);

// 🧾 Проверка пользователя
export const checkUser = onRequest(async (_req, res) => {
  if (setCORS(res, _req)) return;
  res.json({ ok: true, msg: "Check user placeholder" });
});

// 📋 Список пользователей
export const listUsers = onRequest(async (_req, res) => {
  if (setCORS(res, _req)) return;
  res.json({ ok: true, msg: "List users placeholder" });
});

// 💾 Сохранение пользователя
export const saveUser = onRequest(async (req, res) => {
  if (setCORS(res, req)) return;
  res.json({ ok: true, msg: "Save user placeholder" });
});

// 🔐 7. getFirebaseConfig — безопасная выдача firebaseConfig с CORS
export const getFirebaseConfig = onRequest(
  { secrets: [FIREBASE_CONFIG_JSON] },
  async (_req, res) => {
    if (setCORS(res, _req)) return; // ✅ добавили обработку CORS

    try {
      const configString = FIREBASE_CONFIG_JSON.value();
      const config = JSON.parse(configString);

      res.json({
        ok: true,
        config,
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }
);
