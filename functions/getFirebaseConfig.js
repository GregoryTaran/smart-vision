import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { setCORS } from "./cors.js";
import { firebaseConfig } from "./config.js";

// 🔑 Опциональный секрет (если настроен в Firebase Secrets)
const FIREBASE_CONFIG_JSON = defineSecret("FIREBASE_CONFIG_JSON");

export const getFirebaseConfig = onRequest(
  { secrets: [FIREBASE_CONFIG_JSON] },
  async (req, res) => {
    if (setCORS(res, req)) return;

    try {
      if (req.method !== "GET") {
        return res.status(405).json({ ok: false, error: "Method not allowed" });
      }

      let cfg = firebaseConfig;
      try {
        const secretValue = FIREBASE_CONFIG_JSON.value?.();
        if (secretValue) cfg = JSON.parse(secretValue);
      } catch (_) {
        // если секрета нет — просто используем локальный config.js
      }

      return res.status(200).json({
        ok: true,
        config: cfg,
      });
    } catch (err) {
      console.error("❌ getFirebaseConfig error:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }
);
