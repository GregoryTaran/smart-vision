// functions/config.js
console.log("✅ config.js loaded — Firebase Secrets mode active");

// Ми більше не використовуємо dotenv.
// Ключі тепер приходять із Secret Manager (через defineSecret у index.js).

export const ENV = (name, fallback = "") => {
  // Firebase середовище автоматично додає всі Secrets як змінні
  return process.env[name] ?? fallback;
};

// Опціонально (для локальних тестів без секретів можна прописати):
export const firebaseConfig = {
  apiKey: ENV("FIREBASE_API_KEY", "FAKE_KEY_FOR_LOCAL"),
  authDomain: "smart-vision-888.firebaseapp.com",
  projectId: "smart-vision-888",
  storageBucket: "smart-vision-888.appspot.com",
  messagingSenderId: "FAKE_SENDER_ID",
  appId: "FAKE_APP_ID",
};
