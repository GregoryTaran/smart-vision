// ==========================
// 🎤 Smart Vision — speakToWhisper client
// ==========================
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

// Псевдо-стрим (постепенный вывод)
function typeText(text) {
  output.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    output.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 35);
}

// Отправка на Firebase функцию
async function sendToWhisper(blob) {
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64data = reader.result.split(",")[1];
    try {
      const res = await fetch(
        "http://127.0.0.1:5001/smart-vision-888/us-central1/speakToWhisper",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: base64data,
            ext: "webm",
          }),
        }
      );

      const data = await res.json();
      if (data.ok && data.text) typeText(data.text.trim());
      else typeText(`⚠️ ${data.error || "Ошибка при распознавании"}`);
    } catch (err) {
      typeText("❌ Ошибка соединения с сервером");
      console.error(err);
    }
  };
  reader.readAsDataURL(blob);
}

// Запуск / остановка записи
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
      alert("Микрофон недоступен");
      console.error(err);
    }
  } else {
    mediaRecorder.stop();
    isRecording = false;
    button.textContent = "🎤 Говорить";
    button.classList.remove("active");
  }
});
