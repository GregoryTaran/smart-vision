import { onRequest } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import { setCORS } from "./cors.js"; // ✅ универсальный CORS
export { speakToWhisper } from "./speakToWhisper.js";


// Инициализация Firebase Admin SDK
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * 🔹 Сохранение или обновление пользователя
 */
export const saveUser = onRequest(async (req, res) => {
  if (setCORS(res, req)) return;

  try {
    const { email, name } = req.body || {};
    if (!email) {
      return res.status(400).json({ ok: false, error: "Email required" });
    }

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

/**
 * 🔹 Проверка существования пользователя по email
 */
export const checkUser = onRequest(async (req, res) => {
  if (setCORS(res, req)) return;

  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ ok: false, error: "Email required" });
    }

    const ref = db.collection("users").doc(email.toLowerCase());
    const doc = await ref.get();

    if (doc.exists) {
      res.json({ ok: true, exists: true, user: doc.data() });
    } else {
      res.json({ ok: true, exists: false });
    }
  } catch (err) {
    console.error("checkUser error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * 🔹 Получение списка всех пользователей (для страницы /html/users.html)
 */
export const listUsers = onRequest(async (req, res) => {
  if (setCORS(res, req)) return;

  try {
    const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
    const users = snapshot.docs.map(doc => doc.data());
    res.json({ ok: true, users });
  } catch (err) {
    console.error("listUsers error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
