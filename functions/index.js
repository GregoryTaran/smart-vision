/**
 * ✅ Smart Vision — Firebase Functions (универсальный индекс)
 * Все секреты из Google Secret Manager автоматически доступны всем функциям.
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import admin from "firebase-admin";
import { setCORS } from "./cors.js";
export { speakToWhisper } from "./speakToWhisper.js";

/* ============================================================
   🔐 Универсальная секция секретов
   Добавь сюда любые новые секреты — и они будут доступны всем функциям.
   ============================================================ */

const SECRETS = [
  defineSecret("OPENAI_API_KEY"),
  defineSecret("ONESIGNAL_APP_ID"),
  defineSecret("ONESIGNAL_REST_API_KEY"),
  defineSecret("HF_TOKEN"),
  defineSecret("GOOGLE_API_KEY"),
  defineSecret("GOOGLE_KEY_JSON")
];

// Все функции получают доступ к этим секретам через defaultOptions
const defaultOptions = { secrets: SECRETS };

/* ============================================================
   🔧 Инициализация Firebase
   ============================================================ */

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/* ============================================================
   👤 saveUser — создание или обновление пользователя
   ============================================================ */
export const saveUser = onRequest(defaultOptions, async (req, res) => {
  if (setCORS(res, req)) return;

  try {
    const { email, name } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, error: "Email required" });

    const now = new Date().toISOString();
    const ref = db.collection("users").doc(email.toLowerCase());
    const data = {
      email: email.toLowerCase(),
      name: name || "Anonymous",
      updatedAt: now,
    };

    const snap = await ref.get();
    if (snap.exists) {
      await ref.update(data);
    } else {
      await ref.set({ ...data, createdAt: now });
    }

    res.json({ ok: true, user: data });
  } catch (err) {
    console.error("saveUser error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ============================================================
   🔎 checkUser — проверка пользователя по email
   ============================================================ */
export const checkUser = onRequest(defaultOptions, async (req, res) => {
  if (setCORS(res, req)) return;

  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, error: "Email required" });

    const ref = db.collection("users").doc(email.toLowerCase());
    const doc = await ref.get();

    res.json({
      ok: true,
      exists: doc.exists,
      user: doc.exists ? doc.data() : null,
    });
  } catch (err) {
    console.error("checkUser error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ============================================================
   📋 listUsers — получение списка всех пользователей
   ============================================================ */
export const listUsers = onRequest(defaultOptions, async (req, res) => {
  if (setCORS(res, req)) return;

  try {
    const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
    const users = snapshot.docs.map((doc) => doc.data());
    res.json({ ok: true, users });
  } catch (err) {
    console.error("listUsers error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
