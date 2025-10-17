// ==========================
// 🎤 Smart Vision — Voice to Whisper
// ==========================

// Элементы интерфейса
const button = document.createElement("button");
const output = document.createElement("div");
const container = document.querySelector(".vision-container");

button.textContent = "🎤 Говорить";
button.className = "voice-btn";
output.className = "vision-output";
container.appendChild(button);
container.appendChild(output);

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// Плавный вывод текста
function typeText(text) {
  output.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    output.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 30);
}

// Автовыбор API-адреса (локально / прод)
const API_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5001/smart-vision-888/us-central1"
    : "https://us-central1-smart-vision-888.cloudfunctions.net";

// Отправка аудио на Firebase Function
async function sendToWhisper(blob) {
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64data = reader.result.split(",")[1];
    try {
      const res = await fetch(`${API_BASE}/speakToWhisper`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64data, ext: "webm" }),
      });

      const data = await res.json();
      if (data.ok && data.text) {
        typeText(data.text.trim());
      } else {
        typeText(`⚠️ ${data.error || "Ошибка при распознавании речи"}`);
      }
    } catch (err) {
      console.error("Ошибка соединения:", err);
      typeText("❌ Нет соединения с сервером");
    }
  };
  reader.readAsDataURL(blob);
}

// Обработчик кнопки
button.addEventListener("click", async () => {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        await sendToWhisper(blob);
      };

      mediaRecorder.start();
      isRecording = true;
      button.textContent = "⏹ Остановить";
      button.classList.add("active");
      output.textContent = "🎙 Слушаю...";
    } catch (err) {
      console.error("Ошибка микрофона:", err);
      alert("⚠️ Микрофон недоступен");
    }
  } else {
    mediaRecorder.stop();
    isRecording = false;
    button.textContent = "🎤 Говорить";
    button.classList.remove("active");
  }
});
