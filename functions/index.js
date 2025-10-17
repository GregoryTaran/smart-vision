import { onRequest } from "firebase-functions/v2/https";
import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const saveUser = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Use POST" });
    }

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
    if (snap.exists) await ref.update(data);
    else await ref.set({ ...data, createdAt: now });

    res.json({ ok: true, user: data });
  } catch (err) {
    console.error("saveUser error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
