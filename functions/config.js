console.log("✅ config.js loaded");
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ⬇️ Путь к .env в корне проекта
const envPath = path.join(__dirname, "../.local.env");

// ✅ Локально берёт ключи из корневого .env
// ✅ На сервере — автоматически использует Secret Manager
dotenv.config({ path: envPath, override: true });

export const ENV = (name, fallback = "") =>
  process.env[name] ?? fallback;
