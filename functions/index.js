import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { setCORS } from "./cors.js";
import { firebaseConfig } from "./config.js";
import admin from "firebase-admin";

// Инициализация Admin SDK
if (!admin.apps.length) admin.initializeApp();

// 🔹 Импорт отдельных функций
export { checkUser } from "./checkUser.js";
export { saveUser } from "./saveUser.js";
export { speakToWhisper } from "./speakToWhisper.js";
export { getFirebaseConfig } from "./getFirebaseConfig.js";

// === Проверка секретов (служебно)
export const checkSecrets = onRequest(async (req, res) => {
  if (setCORS(res, req)) return;
  try {
    const secrets = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✅" : "❌",
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? "✅" : "❌",
      HF_TOKEN: process.env.HF_TOKEN ? "✅" : "❌",
      FIREBASE_CONFIG_JSON: process.env.FIREBASE_CONFIG_JSON ? "✅" : "❌",
    };
    res.json({ ok: true, secrets });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
