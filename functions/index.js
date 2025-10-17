import { onRequest } from "firebase-functions/v2/https";
import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const ALLOWED_ORIGIN = "https://smartvision-test.web.app";

export const saveUser = onRequest(async (req, res) => {
  const origin = req.headers.origin;

  // ✅ Разрешаем только запросы с твоего сайта
  if (origin === ALLOWED_ORIGIN) {
    res.set("Access-Control-Allow-Origin", origin);
  }

  // Разрешаем нужные методы и заголовки
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Обрабатываем preflight-запрос от браузера
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

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
