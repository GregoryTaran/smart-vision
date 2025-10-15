// js/auth.js
// Smart Vision — Google + Email Link (passwordless) Authentication (Firebase)

// === Firebase конфигурация ===
const firebaseConfig = {
  apiKey: "AIzaSyATQYyB5RbbKqIEN-STvBiVlxPjPRBAtF8",
  authDomain: "smart-vision-888.firebaseapp.com",
  projectId: "smart-vision-888",
  storageBucket: "smart-vision-888.firebasestorage.app",
  messagingSenderId: "485212580203",
  appId: "1:485212580203:web:b9e97383d083be3e4b442e"
};

// === Инициализация Firebase ===
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ==== UI Хелперы ====
function show(selector) {
  document.querySelectorAll(selector).forEach(el => el.classList.remove("hidden"));
}
function hide(selector) {
  document.querySelectorAll(selector).forEach(el => el.classList.add("hidden"));
}
function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}
function toast(msg) { console.log(msg); }

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
  // URL, куда вернётся пользователь после клика по ссылке из письма
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

// При открытии страницы проверяем: это возврат по e-mail ссылке?
async function completeEmailLinkSignInIfNeeded() {
  if (auth.isSignInWithEmailLink(window.location.href)) {
    let email = localStorage.getItem("sv_email_for_signin");
    if (!email) {
      // Если ссылку открыли на другом устройстве — попросим e-mail
      email = window.prompt("Введите e-mail, на который пришла ссылка:");
    }
    try {
      const result = await auth.signInWithEmailLink(email, window.location.href);
      localStorage.removeItem("sv_email_for_signin");
      console.log("Signed in via email link:", result.user?.email);
      // Очистим адресную строку от параметров
      try { window.history.replaceState({}, document.title, "/"); } catch(_) {}
    } catch (e) {
      console.error("signInWithEmailLink error:", e);
      alert("Не удалось завершить вход по ссылке: " + (e?.message || e));
    }
  }
}

// ==== Слушатель состояния ====
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const token = await user.getIdToken();
    setText('[data-auth="email"]', user.email || "Unknown");
    show('[data-auth="in"]');
    hide('[data-auth="out"]');
    document.documentElement.setAttribute("data-user", "signed-in");
  } else {
    setText('[data-auth="email"]', "");
    show('[data-auth="out"]');
    hide('[data-auth="in"]');
    document.documentElement.setAttribute("data-user", "signed-out");
  }
});

// ==== Подключение к кнопкам ====
window.addEventListener("DOMContentLoaded", () => {
  const btnIn = document.querySelector('[data-action="login-google"]');
  const btnOut = document.querySelector('[data-action="logout"]');
  const emailBtn = document.getElementById("email-link-btn");
  if (btnIn) btnIn.addEventListener("click", signInWithGoogle);
  if (btnOut) btnOut.addEventListener("click", () => auth.signOut());
  if (emailBtn) emailBtn.addEventListener("click", sendEmailLink);
  completeEmailLinkSignInIfNeeded();
});
