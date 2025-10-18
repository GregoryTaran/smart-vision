/**
 * functions/index.js
 * "Тонкий" loader — минимальные синхронные импорты, скрытая (ленивая) загрузка тяжёлой логики.
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { setCORS } from "./cors.js";
import { firebaseConfig } from "./config.js";

// Secrets (определяем глобально — это нормально)
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const FIREBASE_CONFIG_JSON = defineSecret("FIREBASE_CONFIG_JSON", { version: "latest" });
const GOOGLE_API_KEY = defineSecret("GOOGLE_API_KEY");
const GOOGLE_KEY_JSON = defineSecret("GOOGLE_KEY_JSON");

// === Вспомогательный wrapper для ленивой загрузки обработчика ===
function lazyHandler(modulePath, exportName = "handler", options = {}) {
  // options.secrets — массив defineSecret (если нужно)
  return onRequest(
    { secrets: options.secrets ?? [] },
    async (req, res) => {
      // CORS preflight
      if (setCORS(res, req)) return;

      try {
        // динамически подгружаем модуль только при вызове
        const mod = await import(modulePath);
        const fn = mod[exportName] ?? mod.default ?? mod;
        if (typeof fn !== "function") {
          console.error("Module does not export a function:", modulePath, exportName);
          return res.status(500).json({ ok: false, error: "Handler not found" });
        }

        // вызываем обработчик — он может быть обычной функцией (req, res) или принимать дополнительные параметры
        return await fn(req, res, { OPENAI_API_KEY, FIREBASE_CONFIG_JSON, GOOGLE_API_KEY, GOOGLE_KEY_JSON, firebaseConfig });
      } catch (err) {
        console.error("Lazy handler error for", modulePath, err);
        return res.status(500).json({ ok: false, error: err.message || String(err) });
      }
    }
  );
}

// === Экспортируем функции ===
// Для speakToWhisper мы явно укажем секрет OPENAI_API_KEY
export const speakToWhisper = lazyHandler("./speakToWhisper.js", "handler", { secrets: [OPENAI_API_KEY] });

// Простые функции — можно держать локально здесь, они лёгкие
export const checkUser = onRequest(async (req, res) => {
  if (setCORS(res, req)) return;
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
    const body = await (req.json ? req.json() : req.body);
    const email = body?.email;
    // Заглушка — заменишь на реальную логику с Firestore
    if (!email) return res.status(400).json({ ok: false, error: "No email" });
    // TODO: проверка в БД
    return res.json({ ok: true, exists: false });
  } catch (err) {
    console.error("checkUser error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export const saveUser = onRequest(async (req, res) => {
  if (setCORS(res, req)) return;
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
    const body = await (req.json ? req.json() : req.body);
    const { email, name } = body || {};
    if (!email) return res.status(400).json({ ok: false, error: "No email" });
    // TODO: сохранение в БД
    return res.json({ ok: true, msg: "Saved (placeholder)" });
  } catch (err) {
    console.error("saveUser error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export const listUsers = onRequest(async (req, res) => {
  if (setCORS(res, req)) return;
  try {
    // лёгкий placeholder
    return res.json({ ok: true, users: [] });
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// getFirebaseConfig — возвращаем JSON из Secret Manager (лениво)
export const getFirebaseConfig = onRequest({ secrets: [FIREBASE_CONFIG_JSON] }, async (req, res) => {
  if (setCORS(res, req)) return;
  try {
    if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });
    const configString = FIREBASE_CONFIG_JSON.value ? FIREBASE_CONFIG_JSON.value() : process.env.FIREBASE_CONFIG_JSON;
    if (!configString) {
      // fallback to local config object if provided
      return res.json({ ok: true, config: firebaseConfig });
    }
    const cfg = JSON.parse(configString);
    return res.json({ ok: true, config: cfg });
  } catch (err) {
    console.error("getFirebaseConfig error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});
