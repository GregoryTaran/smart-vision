// === Smart Vision — Авторизация и Проверка Пользователя ===
// Проверяет локальные данные, при необходимости делает запрос к Cloud Function checkUser
// Если пользователь найден в базе — обновляет локальный профиль и выводит в интерфейс

async function checkAuth() {
  try {
    // 1️⃣ Берём данные из localStorage
    const raw = localStorage.getItem("user");
    let user = raw ? JSON.parse(raw) : null;

    // 2️⃣ Если данных нет или неполные — проверяем в базе по Firebase Auth
    if (!user || !user.email) {
      console.log("🔍 Проверяем пользователя через базу…");
      const firebaseUser = firebase?.auth?.().currentUser;
      if (firebaseUser?.email) {
        user = await fetchUserFromServer(firebaseUser.email);
      }
    }

    // 3️⃣ Если всё ещё нет — редирект на логин
    if (!user || !user.email) {
      console.warn("🚪 Пользователь не найден, перенаправляем на логин");
      window.location.href = "/html/login.html";
      return;
    }

    // 4️⃣ Обновляем интерфейс
    const infoEl = document.getElementById("user-info");
    if (infoEl) {
      infoEl.textContent = `${user.name || "Без имени"} (${user.email})`;
    }

    const logoutEl = document.getElementById("logout");
    if (logoutEl) logoutEl.addEventListener("click", logoutUser);

    window.currentUser = user;
    console.log("✅ Пользователь активен:", user.email);
  } catch (err) {
    console.error("❌ Ошибка в checkAuth:", err);
    window.location.href = "/html/login.html";
  }
}

// === Проверка пользователя в Firestore через Cloud Function ===
async function fetchUserFromServer(email) {
  try {
    const res = await fetch(
      `https://us-central1-smart-vision-888.cloudfunctions.net/checkUser?email=${encodeURIComponent(email)}`
    );
    const data = await res.json();
    if (data.ok && data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("✅ Пользователь найден в базе:", data.user);
      return data.user;
    } else {
      console.warn("⚠️ Пользователь не найден в базе");
      return null;
    }
  } catch (err) {
    console.error("❌ Ошибка при обращении к checkUser:", err);
    return null;
  }
}

// === Выход пользователя ===
function logoutUser() {
  localStorage.removeItem("user");
  sessionStorage.clear();
  if (firebase?.auth) firebase.auth().signOut();
  console.log("🚪 Пользователь вышел");
  window.location.href = "/html/login.html";
}

window.addEventListener("DOMContentLoaded", checkAuth);
