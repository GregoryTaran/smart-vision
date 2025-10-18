// Smart Vision — Authentication Module (Production)

let firebaseConfig = null;
let auth = null;

// === Загрузка Firebase Config ===
async function loadFirebaseConfig() {
  try {
    const res = await fetch("https://us-central1-smart-vision-888.cloudfunctions.net/getFirebaseConfig");
    const data = await res.json();
    if (!data.ok || !data.config) throw new Error("No config returned from server");

    firebaseConfig = data.config;
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    console.log("✅ Firebase initialized from Secret Manager");
    setupAuthListeners();
  } catch (err) {
    console.error("❌ Firebase config error:", err);
    alert("Ошибка подключения к Firebase");
  }
}

// === Google Sign-In ===
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    console.log("✅ Signed in:", user.email);

    // 🔹 Сохраняем или обновляем пользователя в Firestore
    await fetch("https://us-central1-smart-vision-888.cloudfunctions.net/saveUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, name: user.displayName || "Без имени" }),
    });

    // 🔹 Сохраняем локально
    localStorage.setItem("user", JSON.stringify({
      email: user.email,
      name: user.displayName || "Без имени",
    }));

    window.location.href = "/html/dashboard.html";
  } catch (err) {
    console.error("❌ Sign-in error:", err);
    alert("Ошибка входа: " + (err.message || err));
  }
}

// === Слушатель состояния ===
function setupAuthListeners() {
  auth.onAuthStateChanged((user) => {
    if (user) console.log("🔐 Logged in as:", user.email);
    else console.log("🚪 Signed out");
  });

  const btnIn = document.querySelector('[data-action="login-google"]');
  const btnOut = document.querySelector('[data-action="logout"]');
  if (btnIn) btnIn.addEventListener("click", signInWithGoogle);
  if (btnOut) btnOut.addEventListener("click", logout);
}

// === Выход ===
async function logout() {
  await auth.signOut();
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/html/login.html";
  console.log("🚪 Logged out");
}

window.addEventListener("DOMContentLoaded", loadFirebaseConfig);
