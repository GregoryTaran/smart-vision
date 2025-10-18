// Smart Vision — Authentication Module
// Firebase config загружается из Secret Manager через Cloud Function getFirebaseConfig

let firebaseConfig = null;
let auth = null;

// === Загрузка Firebase Config ===
async function loadFirebaseConfig() {
  try {
    console.log("🔄 Requesting Firebase config...");
    const res = await fetch("https://us-central1-smart-vision-888.cloudfunctions.net/getFirebaseConfig");
    const data = await res.json();
    if (!data.ok || !data.config) throw new Error("No config returned from server");

    firebaseConfig = data.config;

    // Инициализация Firebase (проверяем, чтобы не повторять)
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    console.log("✅ Firebase initialized from Secret Manager");

    // После инициализации — навешиваем слушатели
    setupAuthListeners();
  } catch (err) {
    console.error("❌ Failed to load Firebase config:", err);
    alert("Ошибка загрузки конфигурации Firebase. Попробуйте позже.");
  }
}

// ==== UI Helpers ====
function show(sel) { document.querySelectorAll(sel).forEach(el => el.classList.remove("hidden")); }
function hide(sel) { document.querySelectorAll(sel).forEach(el => el.classList.add("hidden")); }
function setText(sel, txt) { const el = document.querySelector(sel); if (el) el.textContent = txt; }
function toast(msg) { console.log("ℹ️", msg); }

// ==== Google Sign-In ====
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    console.log("Signed in:", result.user?.email);
  } catch (e) {
    console.warn("Popup sign-in failed, trying redirect…", e?.message || e);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithRedirect(provider);
    } catch (e2) {
      console.error("Sign-in error:", e2);
      alert("Не удалось войти: " + (e2?.message || e2));
    }
  }
}

// ==== Email Link (passwordless) ====
const actionCodeSettings = {
  url: "https://smartvision.life",
  handleCodeInApp: true
};

async function sendEmailLink() {
  const input = document.getElementById("email-input");
  const email = (input?.value || "").trim();
  if (!email) {
    alert("Укажите e-mail");
    input?.focus();
    return;
  }
  try {
    await auth.sendSignInLinkToEmail(email, actionCodeSettings);
    localStorage.setItem("sv_email_for_signin", email);
    show("#email-hint");
    toast("Ссылка отправлена на " + email);
  } catch (e) {
    console.error("sendSignInLinkToEmail error:", e);
    alert("Не удалось отправить письмо: " + (e?.message || e));
  }
}

async function completeEmailLinkSignInIfNeeded() {
  if (auth.isSignInWithEmailLink(window.location.href)) {
    let email = localStorage.getItem("sv_email_for_signin");
    if (!email) email = window.prompt("Введите e-mail, на который пришла ссылка:");
    try {
      const result = await auth.signInWithEmailLink(email, window.location.href);
      localStorage.removeItem("sv_email_for_signin");
      console.log("Signed in via email link:", result.user?.email);
      try { window.history.replaceState({}, document.title, "/"); } catch (_) {}
    } catch (e) {
      console.error("signInWithEmailLink error:", e);
      alert("Не удалось завершить вход по ссылке: " + (e?.message || e));
    }
  }
}

// ==== Слушатель состояния пользователя ====
function setupAuthListeners() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const token = await user.getIdToken();
      setText('[data-auth="email"]', user.email || "Unknown");
      show('[data-auth="in"]');
      hide('[data-auth="out"]');
      document.documentElement.setAttribute("data-user", "signed-in");
      console.log("🔐 User signed in:", user.email, "token:", token.slice(0,10) + "…");
    } else {
      setText('[data-auth="email"]', "");
      show('[data-auth="out"]');
      hide('[data-auth="in"]');
      document.documentElement.setAttribute("data-user", "signed-out");
      console.log("🚪 User signed out");
    }
  });

  // Подключение кнопок
  const btnIn = document.querySelector('[data-action="login-google"]');
  const btnOut = document.querySelector('[data-action="logout"]');
  const emailBtn = document.getElementById("email-link-btn");
  if (btnIn) btnIn.addEventListener("click", signInWithGoogle);
  if (btnOut) btnOut.addEventListener("click", logout);
  if (emailBtn) emailBtn.addEventListener("click", sendEmailLink);

  completeEmailLinkSignInIfNeeded();
}

// ==== Выход пользователя ====
async function logout() {
  try {
    if (!auth) {
      console.warn("Firebase Auth not initialized yet");
      return;
    }
    localStorage.removeItem("sv_email_for_signin");
    sessionStorage.clear();

    await auth.signOut();

    show('[data-auth="out"]');
    hide('[data-auth="in"]');
    document.documentElement.setAttribute("data-user", "signed-out");

    // Перенаправление на страницу входа
    if (window.location.pathname.includes("dashboard")) {
      window.location.href = "/html/login.html";
    }

    toast("Вы вышли из Smart Vision");
    console.log("✅ User signed out successfully");
  } catch (err) {
    console.error("❌ Logout error:", err);
    alert("Не удалось выйти: " + (err.message || err));
  }
}

// === Автозапуск ===
window.addEventListener("DOMContentLoaded", loadFirebaseConfig);
