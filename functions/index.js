/**
 * Smart Vision — Unified Firebase Functions
 * -----------------------------------------
 * Универсальная структура с автоматическим подключением всех секретов.
 * Грег Таран © 2025
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import admin from "firebase-admin";
import { setCORS } from "./cors.js";
export { speakToWhisper } from "./speakToWhisper.js";
export { getFirebaseConfig } from "./getFirebaseConfig.js";

/* ============================================================
   🔐 1. Секреты (берутся из Google Secret Manager)
   ============================================================ */
const SHARED_SECRETS = [
  defineSecret("FIREBASE_CONFIG_JSON"),
  defineSecret("OPENAI_API_KEY"),
  defineSecret("GOOGLE_API_KEY"),
  defineSecret("ONESIGNAL_APP_ID"),
  defineSecret("ONESIGNAL_REST_API_KEY"),
  defineSecret("HF_TOKEN"),
  defineSecret("GOOGLE_KEY_JSON"),
];

export const defaultOptions = { secrets: SHARED_SECRETS };

/* ============================================================
   ⚙️ 2. Инициализация Firebase Admin SDK
   ============================================================ */
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/* ============================================================
   👤 3. saveUser — создание или обновление пользователя
   ============================================================ */
export const saveUser = onRequest(defaultOptions, async (req, res) => {
  if (setCORS(res, req)) return;
  try {
    const { email, name } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, error: "Email required" });

    const now = new Date().toISOString();
    const ref = db.collection("users").doc(email.toLowerCase());
    const data = { email: email.toLowerCase(), name: name || "Anonymous", updatedAt: now };

    const snap = await ref.get();
    snap.exists ? await ref.update(data) : await ref.set({ ...data, createdAt: now });

    res.json({ ok: true, user: data });
  } catch (err) {
    console.error("saveUser error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ============================================================
   🔍 4. checkUser — проверка наличия пользователя
   ============================================================ */
export const checkUser = onRequest(defaultOptions, async (req, res) => {
  if (setCORS(res, req)) return;
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, error: "Email required" });

    const doc = await db.collection("users").doc(email.toLowerCase()).get();
    res.json({ ok: true, exists: doc.exists, user: doc.data() || null });
  } catch (err) {
    console.error("checkUser error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ============================================================
   📋 5. listUsers — список всех пользователей
   ============================================================ */
export const listUsers = onRequest(defaultOptions, async (_req, res) => {
  if (setCORS(res, _req)) return;
  try {
    const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
    const users = snapshot.docs.map((doc) => doc.data());
    res.json({ ok: true, users });
  } catch (err) {
    console.error("listUsers error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ============================================================
   🧠 6. checkSecrets — диагностика секретов
   ============================================================ */
export const checkSecrets = onRequest(defaultOptions, async (_req, res) => {
  const result = {};
  for (const s of SHARED_SECRETS) {
    try {
      result[s.name] = s.value() ? "✅ visible" : "❌ missing";
    } catch {
      result[s.name] = "❌ missing";
    }
  }
  res.json(result);
});

/* ============================================================
   🔐 7. getFirebaseConfig — безопасная выдача firebaseConfig
   ============================================================ */
const FIREBASE_CONFIG_JSON = SHARED_SECRETS.find(
  (s) => s.name === "FIREBASE_CONFIG_JSON"
);

export const getFirebaseConfig = onRequest(
  { secrets: [FIREBASE_CONFIG_JSON] },
  async (_req, res) => {
    try {
      const configString = FIREBASE_CONFIG_JSON.value();
      const config = JSON.parse(configString);
      res.json({ ok: true, config });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }
);
