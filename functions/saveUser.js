import { onRequest } from "firebase-functions/v2/https";
import { setCORS } from "./cors.js";
import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const saveUser = onRequest(async (req, res) => {
  if (setCORS(res, req)) return;

  try {
    let email, name;

    // ✅ Разрешаем POST и GET
    if (req.method === "POST") {
      ({ email, name } = req.body || {});
    } else if (req.method === "GET") {
      email = req.query.email;
      name = req.query.name || "Без имени";
    } else {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    if (!email) return res.status(400).json({ ok: false, error: "Missing email" });

    const ref = db.collection("users").doc(email);
    await ref.set(
      {
        email,
        name,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`✅ User saved: ${email}`);
    res.json({ ok: true, email });
  } catch (err) {
    console.error("saveUser error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
