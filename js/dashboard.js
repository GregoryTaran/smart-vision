import { userStorage } from "./user.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = userStorage.get();

  if (!user || !user.isLoggedIn) {
    window.location.href = "/html/login.html";
    return;
  }

  document.getElementById("user-info").innerText =
    `Привет, ${user.name} (${user.email})`;
});
