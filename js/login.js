import { userStorage } from "./user.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");

  // Если уже вошёл — сразу на дашборд
  const existing = userStorage.get();
  if (existing && existing.isLoggedIn) {
    window.location.href = "/html/dashboard.html";
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = {
      name: nameInput.value.trim().slice(0, 30),
      email: emailInput.value.trim(),
      isLoggedIn: true,
      createdAt: new Date().toISOString(),
    };

    userStorage.save(user);
    window.location.href = "/html/dashboard.html";
  });
});
