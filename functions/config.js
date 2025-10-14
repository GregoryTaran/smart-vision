import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".local.env"); // новое имя

dotenv.config({ path: envPath, override: true });

export const ENV = (name, fallback = "") =>
  process.env[name] ?? fallback;
